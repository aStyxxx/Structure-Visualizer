document.addEventListener('DOMContentLoaded', () => {
    // =========================================================
    // 1. UI Elements (ЕЛЕМЕНТИ ІНТЕРФЕЙСУ)
    // =========================================================
    // Цей блок коду "чіпляється" за HTML-елементи сторінки за їхніми ID або класами.
    // Наприклад, document.getElementById('btn-run') знаходить кнопку "Run" у HTML,
    // щоб ми могли потім "слухати" кліки по ній (через addEventListener).
    const navItems = document.querySelectorAll('.nav-menu li');
    const visualizerPlaceholderContainer = document.querySelector('.canvas-placeholder');
    const visualizerPlaceholderText = document.querySelector('.canvas-placeholder p');
    const visualizerContainer = document.getElementById('visualizer-container');
    
    const paletteContainer = document.getElementById('block-palette');
    const workspaceContainer = document.getElementById('script-workspace');
    const blocksPanel = document.querySelector('.blocks-panel');
    const paletteColumn = document.querySelector('.palette-column');
    const workspaceColumn = document.querySelector('.workspace-column');
    const blocksResizer = document.getElementById('blocks-resizer');
    const paletteCloseBtn = document.getElementById('palette-close-btn');
    const paletteShowBtn = document.getElementById('palette-show-btn');
    
    const sidebar = document.getElementById('sidebar');
    const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
    const sidebarShowBtn = document.getElementById('sidebar-show-btn');
    const appContainer = document.getElementById('app-container');

    const btnRun = document.getElementById('btn-run');
    const btnStep = document.getElementById('btn-step');
    const btnPause = document.getElementById('btn-pause');
    const btnClearVis = document.getElementById('btn-clear-vis');
    const btnClearScript = document.getElementById('btn-clear-script');

    // Modal Elements
    const modal = document.getElementById('code-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalCodeSnippet = document.getElementById('modal-code-snippet');
    const modalLangSelect = document.getElementById('modal-language-select');
    const modalAlgoSelect = document.getElementById('modal-algorithm-select');

    // =========================================================
    // 2. State (ПОТОЧНИЙ СТАН ДОДАТКУ ТА ДАНІ)
    // =========================================================
    // Глобальні змінні, які зберігають важливу інформацію під час роботи сторінки.
    // currentStructure - зберігає назву обраної структури (напр., 'singly-linked-list').
    // structureData - найважливіша змінна! Тут лежать реальні дані (елементи списку, вершини графа).
    // isExecuting - показує, чи зараз працює алгоритм (щоб блокувати кнопки).
    let currentStructure = 'singly-linked-list';
    let structureData = [];
    let isExecuting = false;
    let executionId = 0;
    let isPaused = false;
    let stepIndex = 0;
    let animationSpeedMultiplier = 1.0;

    // =========================================================
    // 3. Localization (СЛОВНИК ТА ПЕРЕКЛАДИ)
    // =========================================================
    // Об'єкт `translations` містить словники для англійської ('en') та української ('uk') мов.
    // Функція applyTranslations() просто бере слова звідси і вставляє їх у відповідні кнопки та заголовки.
    const translations = {
        'en': {
            'visualizing': 'Visualizing',
            'run': '▶ Run',
            'pause': '⏸ Pause',
            'resume': '▶ Resume',
            'step': '⏭ Step',
            'clear_vis': '⏹ Clear Vis',
            'clear_script': '🗑 Clear Script',
            'empty_workspace': 'Click a block in the palette to add it here...',
            'bfs_desc': 'BFS (Breadth-First Search) explores the graph layer by layer using a Queue.',
            'dfs_desc': 'DFS (Depth-First Search) explores the graph as deep as possible before backtracking using a Stack.',
            'singly-linked-list': 'Singly Linked List',
            'doubly-linked-list': 'Doubly Linked List',
            'circular-linked-list': 'Circular Linked List',
            'directed-graph': 'Directed Graph',
            'undirected-graph': 'Undirected Graph',
            'binary-search-tree': 'Binary Search Tree',
            'avl-tree': 'AVL Tree',
            'queue': 'Queue:',
            'stack': 'Stack:',
            'visited': 'Visited:',
            'categories': { 'linkedLists': 'Linked Lists', 'graphs': 'Graphs', 'trees': 'Trees' },
            'palette': 'Blocks Palette',
            'workspace': 'Script Workspace',
            'speed': 'Speed'
        },
        'uk': {
            'visualizing': 'Візуалізація',
            'run': '▶ Запуск',
            'pause': '⏸ Пауза',
            'resume': '▶ Продовжити',
            'step': '⏭ Крок',
            'clear_vis': '⏹ Очистити Віз.',
            'clear_script': '🗑 Оч. Скрипт',
            'empty_workspace': 'Натисніть на блок у палітрі, щоб додати його сюди...',
            'bfs_desc': 'BFS (Пошук в ширину) обходить граф рівень за рівнем, використовуючи Чергу (Queue).',
            'dfs_desc': 'DFS (Пошук в глибину) йде вглиб графа настільки далеко, наскільки це можливо, використовуючи Стек (Stack).',
            'categories': { 'linkedLists': 'Списки', 'graphs': 'Графи', 'trees': 'Дерева' },
            'palette': 'Блоки',
            'workspace': 'Робоча область',
            'singly-linked-list': 'Однозв\'язний список',
            'doubly-linked-list': 'Двозв\'язний список',
            'circular-linked-list': 'Кільцевий список',
            'directed-graph': 'Орієнтований граф',
            'undirected-graph': 'Неорієнтований граф',
            'binary-search-tree': 'Бінарне дерево пошуку',
            'avl-tree': 'АВЛ Дерево',
            'queue': 'Черга (Queue):',
            'stack': 'Стек (Stack):',
            'visited': 'Відвідані:',
            'speed': 'Швидкість'
        }
    };
    
    let currentLang = 'en';
    
    function applyTranslations() {
        const t = translations[currentLang];
        btnRun.textContent = t.run;
        btnPause.textContent = isPaused ? t.resume : t.pause;
        btnStep.textContent = t.step;
        btnClearVis.textContent = t.clear_vis;
        btnClearScript.textContent = t.clear_script;
        
        if (workspaceContainer.innerHTML.includes('empty-text')) {
            workspaceContainer.innerHTML = `<p class="empty-text">${t.empty_workspace}</p>`;
        }
        
        navItems.forEach(item => {
            const struct = item.getAttribute('data-structure');
            if (t[struct]) {
                item.textContent = t[struct];
            }
            if (item.classList.contains('active')) {
                visualizerPlaceholderText.textContent = `${t.visualizing}: ${t[struct] || item.textContent}`;
            }
        });
        
        const speedLabel = document.getElementById('speed-label');
        if (speedLabel) speedLabel.textContent = `${t.speed}: ${typeof animationSpeedMultiplier !== 'undefined' ? animationSpeedMultiplier : 1}x`;

        const catLinked = document.getElementById('cat-linked-lists');
        if (catLinked) catLinked.textContent = t.categories.linkedLists;
        
        const catGraphs = document.getElementById('cat-graphs');
        if (catGraphs) catGraphs.textContent = t.categories.graphs;
        
        const catTrees = document.getElementById('cat-trees');
        if (catTrees) catTrees.textContent = t.categories.trees;
        
        const titlePalette = document.getElementById('title-blocks-palette');
        if (titlePalette) titlePalette.textContent = t.palette;
        
        const titleWorkspace = document.getElementById('title-script-workspace');
        if (titleWorkspace) titleWorkspace.textContent = t.workspace;

        // Home Page updates
        const homeSubtitle = document.getElementById('home-subtitle');
        if (homeSubtitle) {
            homeSubtitle.textContent = currentLang === 'uk' ? 'Інтерактивний візуалізатор структур даних' : 'Interactive Data Structure Visualizer';
            document.getElementById('home-desc-en').style.display = currentLang === 'en' ? 'block' : 'none';
            document.getElementById('home-desc-uk').style.display = currentLang === 'uk' ? 'block' : 'none';
            document.getElementById('home-btn-text').textContent = currentLang === 'uk' ? 'Спробувати візуалізатор' : 'Try Visualizer';
            document.getElementById('support-text').textContent = currentLang === 'uk' ? 'Підтримати (Monobank)' : 'Donate via Monobank';
            
            document.getElementById('home-lang-en').classList.toggle('active', currentLang === 'en');
            document.getElementById('home-lang-uk').classList.toggle('active', currentLang === 'uk');
            
            if (currentLang === 'en') {
                document.getElementById('home-lang-en').style.fontWeight = 'bold';
                document.getElementById('home-lang-en').style.color = 'var(--text-main)';
                document.getElementById('home-lang-uk').style.fontWeight = 'normal';
                document.getElementById('home-lang-uk').style.color = 'var(--text-muted)';
            } else {
                document.getElementById('home-lang-uk').style.fontWeight = 'bold';
                document.getElementById('home-lang-uk').style.color = 'var(--text-main)';
                document.getElementById('home-lang-en').style.fontWeight = 'normal';
                document.getElementById('home-lang-en').style.color = 'var(--text-muted)';
            }
        }
    }

    window.setLang = function(lang) {
        if (lang === 'en') {
            document.getElementById('lang-en').click();
        } else {
            document.getElementById('lang-uk').click();
        }
    };

    window.startVisualizer = function() {
        const homePage = document.getElementById('home-page');
        const appContainer = document.getElementById('app-container');
        
        // Trigger home page fold-away
        homePage.classList.add('anim-out');
        
        // Wait for the fold-away animation
        setTimeout(() => {
            homePage.style.display = 'none';
            appContainer.style.display = 'flex';
            
            // Force browser reflow to apply display:flex before adding loaded class
            void appContainer.offsetWidth;
            
            // Add loaded class to trigger main app components sliding in
            appContainer.classList.add('loaded');
            renderVisualizer();
        }, 500); // 500ms aligns closely with the 0.6s css transition
    };

    window.goHome = function() {
        const homePage = document.getElementById('home-page');
        const appContainer = document.getElementById('app-container');
        
        // Trigger main app sliding out
        appContainer.classList.remove('loaded');
        
        // Wait for sliding out to finish
        setTimeout(() => {
            appContainer.style.display = 'none';
            homePage.style.display = 'flex';
            
            // Force browser reflow
            void homePage.offsetWidth;
            
            // Trigger home page unfolding
            homePage.classList.remove('anim-out');
        }, 600); // 600ms aligns with sliding animations
    };

    document.getElementById('lang-en').addEventListener('click', () => {
        currentLang = 'en';
        document.getElementById('lang-en').classList.add('active');
        document.getElementById('lang-en').style.fontWeight = 'bold';
        document.getElementById('lang-en').style.color = 'var(--text-main)';
        document.getElementById('lang-uk').classList.remove('active');
        document.getElementById('lang-uk').style.fontWeight = 'normal';
        document.getElementById('lang-uk').style.color = 'var(--text-muted)';
        applyTranslations();
    });
    
    document.getElementById('lang-uk').addEventListener('click', () => {
        currentLang = 'uk';
        document.getElementById('lang-uk').classList.add('active');
        document.getElementById('lang-uk').style.fontWeight = 'bold';
        document.getElementById('lang-uk').style.color = 'var(--text-main)';
        document.getElementById('lang-en').classList.remove('active');
        document.getElementById('lang-en').style.fontWeight = 'normal';
        document.getElementById('lang-en').style.color = 'var(--text-muted)';
        applyTranslations();
    });
    
    // Initial apply
    applyTranslations();

    // =========================================================
    // 4. Події меню та згортання панелей (Sidebar / Palette Toggle)
    // =========================================================
    // Цей розділ обробляє кліки по боковому меню. Він відкриває і закриває
    // списки, дерева і графи, а також ховає або показує самі панелі екрану.
    document.querySelectorAll('.nav-group h3').forEach(header => {
        header.addEventListener('click', () => {
            header.parentElement.classList.toggle('collapsed');
        });
    });

    // --- Sidebar Toggle ---
    function initSidebarToggle() {
        if (!sidebar || !sidebarCloseBtn || !sidebarShowBtn || !appContainer) return;

        sidebarCloseBtn.addEventListener('click', () => {
            appContainer.classList.add('is-sidebar-hidden');
        });

        sidebarShowBtn.addEventListener('click', () => {
            appContainer.classList.remove('is-sidebar-hidden');
        });
    }

    // --- Palette Toggle ---
    function initPaletteToggle() {
        const mainContent = document.querySelector('.main-content');
        if (!blocksPanel || !paletteCloseBtn || !paletteShowBtn || !mainContent || !paletteColumn) return;

        paletteCloseBtn.addEventListener('click', () => {
            const paletteWidth = paletteColumn.offsetWidth;
            blocksPanel.style.width = ''; // clear any old inline widths just in case
            
            const currentBlocksWidth = blocksPanel.offsetWidth;
            blocksPanel.dataset.hiddenPaletteWidth = paletteWidth;
            blocksPanel.style.flex = `0 0 ${currentBlocksWidth - paletteWidth}px`;
            
            blocksPanel.classList.add('is-palette-hidden');
            paletteColumn.classList.add('collapsed');
            paletteCloseBtn.style.display = 'none';
            paletteShowBtn.style.display = 'block';
        });

        paletteShowBtn.addEventListener('click', () => {
            blocksPanel.classList.remove('is-palette-hidden');
            paletteColumn.classList.remove('collapsed');
            
            const paletteWidthToRestore = parseFloat(blocksPanel.dataset.hiddenPaletteWidth) || 200;
            const currentBlocksWidth = blocksPanel.offsetWidth;
            blocksPanel.style.flex = `0 0 ${currentBlocksWidth + paletteWidthToRestore}px`;
            
            paletteCloseBtn.style.display = 'block';
            paletteShowBtn.style.display = 'none';
        });
    }

    // =========================================================
    // 5. Зміна розміру панелей мишкою (Drag-and-Drop Resize)
    // =========================================================
    // Ці функції "слухають" події натискання (mousedown), руху миші (mousemove) 
    // та відпускання (mouseup) на розділювачі (resizer). Це дозволяє розширювати
    // або звужувати колонку з блоками.
    function initBlocksPanelResize() {
        if (!blocksPanel || !paletteColumn || !workspaceColumn || !blocksResizer) return;

        const minPaletteWidth = 330;
        const minWorkspaceWidth = 330;
        const resizeStep = 20;
        let startX = 0;
        let startPaletteWidth = 0;
        let totalResizableWidth = 0;

        const setPaletteWidth = (width, totalWidth = paletteColumn.offsetWidth + workspaceColumn.offsetWidth) => {
            if (totalWidth <= 0) return;

            const maxPaletteWidth = Math.max(minPaletteWidth, totalWidth - minWorkspaceWidth);
            const nextWidth = Math.min(Math.max(width, minPaletteWidth), maxPaletteWidth);
            
            const percentage = (nextWidth / totalWidth) * 100;
            blocksPanel.style.setProperty('--palette-column-width', `${percentage}%`);
            blocksResizer.setAttribute('aria-valuenow', Math.round(percentage));
        };

        const stopResize = () => {
            blocksPanel.classList.remove('is-resizing');
            document.body.classList.remove('is-resizing-blocks');
            window.removeEventListener('pointermove', resize);
            window.removeEventListener('pointerup', stopResize);
            window.removeEventListener('pointercancel', stopResize);
        };

        const resize = (event) => {
            const delta = event.clientX - startX;
            setPaletteWidth(startPaletteWidth + delta, totalResizableWidth);
        };

        blocksResizer.setAttribute('aria-valuemin', '0');
        blocksResizer.setAttribute('aria-valuemax', '100');
        blocksResizer.setAttribute('aria-valuenow', '50');

        blocksResizer.addEventListener('pointerdown', (event) => {
            event.preventDefault();
            startX = event.clientX;
            startPaletteWidth = paletteColumn.offsetWidth;
            totalResizableWidth = paletteColumn.offsetWidth + workspaceColumn.offsetWidth;

            blocksPanel.classList.add('is-resizing');
            document.body.classList.add('is-resizing-blocks');
            blocksResizer.setPointerCapture?.(event.pointerId);
            window.addEventListener('pointermove', resize);
            window.addEventListener('pointerup', stopResize);
            window.addEventListener('pointercancel', stopResize);
        });

        blocksResizer.addEventListener('keydown', (event) => {
            if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

            event.preventDefault();
            const direction = event.key === 'ArrowLeft' ? -1 : 1;
            setPaletteWidth(paletteColumn.offsetWidth + direction * resizeStep);
        });

        window.addEventListener('resize', () => {
            setPaletteWidth(paletteColumn.offsetWidth);
        });
    }

    // --- Main Panel Resize ---
    function initMainPanelResize() {
        const mainResizer = document.getElementById('main-resizer');
        const mainContent = document.querySelector('.main-content');
        if (!blocksPanel || !mainResizer || !mainContent) return;

        let startX = 0;
        let startBlocksWidth = 0;

        const resize = (event) => {
            const delta = event.clientX - startX;
            const minBlocksWidth = blocksPanel.classList.contains('is-palette-hidden') ? 330 : 668;
            const maxBlocksWidth = window.innerWidth - 300 - (appContainer.classList.contains('is-sidebar-hidden') ? 0 : sidebar.offsetWidth) - (mainResizer.offsetWidth || 8);
            
            let nextWidth = startBlocksWidth - delta;
            nextWidth = Math.min(Math.max(nextWidth, minBlocksWidth), maxBlocksWidth);
            
            blocksPanel.style.flex = `0 0 ${nextWidth}px`;
        };

        const stopResize = () => {
            document.body.classList.remove('is-resizing-main');
            window.removeEventListener('pointermove', resize);
            window.removeEventListener('pointerup', stopResize);
            window.removeEventListener('pointercancel', stopResize);
        };

        mainResizer.addEventListener('pointerdown', (event) => {
            event.preventDefault();
            startX = event.clientX;
            startBlocksWidth = blocksPanel.offsetWidth;

            document.body.classList.add('is-resizing-main');
            mainResizer.setPointerCapture?.(event.pointerId);
            window.addEventListener('pointermove', resize);
            window.addEventListener('pointerup', stopResize);
            window.addEventListener('pointercancel', stopResize);
        });
    }

    // =========================================================
    // 6. Масштабування та панорамування полотна (Canvas Zoom & Pan)
    // =========================================================
    // Цей код обробляє коліщатко миші (wheel) для зуму та затискання кнопки
    // для перетягування (pan) усього контейнера з графами.
    // Також тут є логіка для сенсорних екранів телефонів (touchstart/touchmove) 
    // для жестів "щипком" (pinch-to-zoom) двома пальцями.
    let zoomLevel = 1;
    let panX = 0;
    let panY = 0;
    let isDraggingCanvas = false;
    let startPanX = 0;
    let startPanY = 0;

    function applyCanvasTransform() {
        visualizerContainer.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel})`;
    }

    document.getElementById('btn-zoom-in').addEventListener('click', () => {
        zoomLevel = Math.min(zoomLevel + 0.2, 3);
        applyCanvasTransform();
    });
    
    document.getElementById('btn-zoom-out').addEventListener('click', () => {
        zoomLevel = Math.max(zoomLevel - 0.2, 0.2);
        applyCanvasTransform();
    });
    
    document.getElementById('btn-zoom-reset').addEventListener('click', () => {
        zoomLevel = 1;
        panX = 0;
        panY = 0;
        applyCanvasTransform();
    });

    function autoFit() {
        zoomLevel = 1;
        panX = 0;
        panY = 0;
        applyCanvasTransform();
        if (!isExecuting) {
            renderVisualizer();
        }
    }

    window.addEventListener('resize', () => {
        if (!isExecuting) renderVisualizer();
    });

    visualizerContainer.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'BUTTON') return;
        isDraggingCanvas = true;
        startPanX = e.clientX - panX;
        startPanY = e.clientY - panY;
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDraggingCanvas) return;
        panX = e.clientX - startPanX;
        panY = e.clientY - startPanY;
        applyCanvasTransform();
    });

    window.addEventListener('mouseup', () => {
        isDraggingCanvas = false;
    });

    // Mouse Wheel Zoom
    document.querySelector('.visualization-area').addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomStep = 0.1;
        if (e.deltaY < 0) {
            zoomLevel = Math.min(zoomLevel + zoomStep, 3);
        } else {
            zoomLevel = Math.max(zoomLevel - zoomStep, 0.2);
        }
        applyCanvasTransform();
    }, { passive: false });

    // Touch support for Pan and Pinch-to-Zoom
    let initialTouchDist = null;
    let initialZoom = 1;

    document.querySelector('.visualization-area').addEventListener('touchstart', (e) => {
        if (e.target.tagName === 'BUTTON') return;
        if (e.touches.length === 1) {
            isDraggingCanvas = true;
            startPanX = e.touches[0].clientX - panX;
            startPanY = e.touches[0].clientY - panY;
        } else if (e.touches.length === 2) {
            isDraggingCanvas = false;
            initialTouchDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            initialZoom = zoomLevel;
        }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
        if (isDraggingCanvas && e.touches.length === 1) {
            panX = e.touches[0].clientX - startPanX;
            panY = e.touches[0].clientY - startPanY;
            applyCanvasTransform();
        } else if (e.touches.length === 2 && initialTouchDist) {
            e.preventDefault(); // Prevent browser zoom/scroll
            const currentDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const scale = currentDist / initialTouchDist;
            zoomLevel = Math.max(0.2, Math.min(initialZoom * scale, 3));
            applyCanvasTransform();
        }
    }, { passive: false });

    window.addEventListener('touchend', (e) => {
        if (e.touches.length === 0) {
            isDraggingCanvas = false;
            initialTouchDist = null;
        } else if (e.touches.length === 1) {
            startPanX = e.touches[0].clientX - panX;
            startPanY = e.touches[0].clientY - panY;
            isDraggingCanvas = true;
        }
    });

    // =========================================================
    // 7. Словник усіх Блоків та Коду (Block Definitions & Code)
    // =========================================================
    // Тут описані всі можливі блоки, які є в програмі (їх колір, назва, поля вводу).
    // А також об'єкт codeSnippets, який містить реальний код алгоритмів 
    // різними мовами (C++, Python, Java, JS) для показу у модальному вікні.
    const blockTypes = {
        'linked-list': [
            { id: 'add_head', label: 'add_head', type: 'add', inputs: ['val'] },
            { id: 'add_tail', label: 'add_tail', type: 'add', inputs: ['val'] },
            { id: 'insert_at', label: 'insert_at', type: 'add', inputs: ['index', 'val'] },
            { id: 'remove_head', label: 'remove_head', type: 'remove' },
            { id: 'remove_tail', label: 'remove_tail', type: 'remove' },
            { id: 'reverse', label: 'reverse', type: 'action' },
            { id: 'print', label: 'print', type: 'action' },
            { id: 'sort', label: 'sort', type: 'action', hasSelect: true, options: ['Bubble Sort', 'Selection Sort', 'Insertion Sort', 'Quick Sort'] }
        ],
        'graph': [
            { id: 'add_vertex', label: 'add_vertex', type: 'add', inputs: ['val'] },
            { id: 'add_edge', label: 'add_edge', type: 'add', inputs: ['u', 'v'] },
            { id: 'bfs', label: 'bfs', type: 'action', inputs: ['start'] },
            { id: 'dfs', label: 'dfs', type: 'action', inputs: ['start'] }
        ],
        'tree': [
            { id: 'insert', label: 'insert', type: 'add', inputs: ['val'] },
            { id: 'search', label: 'search', type: 'action', inputs: ['val'] }
        ]
    };

    const blockCodes = {
        'singly-linked-list': {
            'add_head': {
                'cpp': 'void insertAtHead(int val) {\n    Node* newNode = new Node(val);\n    newNode->next = head;\n    head = newNode;\n}',
                'python': 'def add_head(self, data):\n    new_node = Node(data)\n    new_node.next = self.head\n    self.head = new_node',
                'java': 'void insertAtHead(int val) {\n    Node newNode = new Node(val);\n    newNode.next = head;\n    head = newNode;\n}',
                'javascript': 'addHead(data) {\n    const newNode = new Node(data);\n    newNode.next = this.head;\n    this.head = newNode;\n}'
            },
            'add_tail': {
                'cpp': 'void insertAtTail(int val) {\n    Node* newNode = new Node(val);\n    if(!head) { head = newNode; return; }\n    Node* temp = head;\n    while(temp->next) temp = temp->next;\n    temp->next = newNode;\n}',
                'python': 'def add_tail(self, data):\n    new_node = Node(data)\n    if not self.head:\n        self.head = new_node\n        return\n    last = self.head\n    while last.next:\n        last = last.next\n    last.next = new_node',
                'java': 'void insertAtTail(int val) {\n    Node newNode = new Node(val);\n    if(head == null) { head = newNode; return; }\n    Node temp = head;\n    while(temp.next != null) temp = temp.next;\n    temp.next = newNode;\n}',
                'javascript': 'addTail(data) {\n    const newNode = new Node(data);\n    if(!this.head) { this.head = newNode; return; }\n    let temp = this.head;\n    while(temp.next) temp = temp.next;\n    temp.next = newNode;\n}'
            },
            'insert_at': {
                'cpp': 'Node* insert_at(Node* head, int position, int data) {\n    Node* new_node = new Node(data);\n    if (position == 0) {\n        new_node->next = head;\n        return new_node;\n    }\n    Node* current = head;\n    for (int i = 0; i < position - 1; ++i) {\n        if (current == nullptr) {\n            delete new_node;\n            throw std::out_of_range("Position out of bounds");\n        }\n        current = current->next;\n    }\n    if (current == nullptr) {\n        delete new_node;\n        throw std::out_of_range("Position out of bounds");\n    }\n    new_node->next = current->next;\n    current->next = new_node;\n    return head;\n}',
                'python': 'def insert_at(self, position, data):\n    new_node = Node(data)\n    if position == 0:\n        new_node.next = self.head\n        self.head = new_node\n        return\n    current = self.head\n    for _ in range(position - 1):\n        if current is None:\n            raise IndexError("Position out of bounds")\n        current = current.next\n    if current is None:\n        raise IndexError("Position out of bounds")\n    new_node.next = current.next\n    current.next = new_node',
                'java': 'void insertAt(int position, int data) {\n    Node newNode = new Node(data);\n    if (position == 0) {\n        newNode.next = head;\n        head = newNode;\n        return;\n    }\n    Node current = head;\n    for (int i = 0; i < position - 1; i++) {\n        if (current == null) {\n            throw new IndexOutOfBoundsException("Position out of bounds");\n        }\n        current = current.next;\n    }\n    if (current == null) {\n        throw new IndexOutOfBoundsException("Position out of bounds");\n    }\n    newNode.next = current.next;\n    current.next = newNode;\n}',
                'javascript': 'insertAt(position, data) {\n    const newNode = new Node(data);\n    if (position === 0) {\n        newNode.next = this.head;\n        this.head = newNode;\n        return;\n    }\n    let current = this.head;\n    for (let i = 0; i < position - 1; i++) {\n        if (current === null) {\n            throw new Error("Position out of bounds");\n        }\n        current = current.next;\n    }\n    if (current === null) {\n        throw new Error("Position out of bounds");\n    }\n    newNode.next = current.next;\n    current.next = newNode;\n}'
            },
            'remove_head': {
                'cpp': 'void removeHead() {\n    if(!head) return;\n    Node* temp = head;\n    head = head->next;\n    delete temp;\n}',
                'python': 'def remove_head(self):\n    if self.head:\n        self.head = self.head.next',
                'java': 'void removeHead() {\n    if(head != null) head = head.next;\n}',
                'javascript': 'removeHead() {\n    if(this.head) this.head = this.head.next;\n}'
            },
            'remove_tail': {
                'cpp': 'void removeTail() {\n    if(!head) return;\n    if(!head->next) { delete head; head = nullptr; return; }\n    Node* temp = head;\n    while(temp->next->next) temp = temp->next;\n    delete temp->next;\n    temp->next = nullptr;\n}',
                'python': 'def remove_tail(self):\n    if not self.head: return\n    if not self.head.next: self.head = None; return\n    temp = self.head\n    while temp.next.next:\n        temp = temp.next\n    temp.next = None',
                'java': 'void removeTail() {\n    if(head == null) return;\n    if(head.next == null) { head = null; return; }\n    Node temp = head;\n    while(temp.next.next != null) temp = temp.next;\n    temp.next = null;\n}',
                'javascript': 'removeTail() {\n    if(!this.head) return;\n    if(!this.head.next) { this.head = null; return; }\n    let temp = this.head;\n    while(temp.next.next) temp = temp.next;\n    temp.next = null;\n}'
            },
            'reverse': {
                'cpp': 'Node* reverse(Node* head) {\n    Node* prev = nullptr;\n    Node* current = head;\n    Node* next = nullptr;\n    while (current != nullptr) {\n        next = current->next;\n        current->next = prev;\n        prev = current;\n        current = next;\n    }\n    return prev;\n}',
                'python': 'def reverse(self):\n    prev = None\n    current = self.head\n    while current is not None:\n        next_node = current.next\n        current.next = prev\n        prev = current\n        current = next_node\n    self.head = prev',
                'java': 'void reverse() {\n    Node prev = null;\n    Node current = head;\n    Node next = null;\n    while (current != null) {\n        next = current.next;\n        current.next = prev;\n        prev = current;\n        current = next;\n    }\n    head = prev;\n}',
                'javascript': 'reverse() {\n    let prev = null;\n    let current = this.head;\n    let next = null;\n    while (current !== null) {\n        next = current.next;\n        current.next = prev;\n        prev = current;\n        current = next;\n    }\n    this.head = prev;\n}'
            },
            'print': {
                'cpp': 'void print() {\n    Node* temp = head;\n    while(temp) {\n        cout << temp->data << " -> ";\n        temp = temp->next;\n    }\n    cout << "NULL\\n";\n}',
                'python': 'def print_list(self):\n    temp = self.head\n    while temp:\n        print(temp.data, end=" -> ")\n        temp = temp.next\n    print("None")',
                'java': 'void print() {\n    Node temp = head;\n    while(temp != null) {\n        System.out.print(temp.data + " -> ");\n        temp = temp.next;\n    }\n    System.out.println("null");\n}',
                'javascript': 'print() {\n    let temp = this.head;\n    let str = "";\n    while(temp) {\n        str += temp.data + " -> ";\n        temp = temp.next;\n    }\n    console.log(str + "null");\n}'
            },
            'sort': {
                'Bubble Sort': {
                    'cpp': '// Bubble Sort\nvoid bubbleSort() {\n    if(!head) return;\n    bool swapped;\n    Node* ptr1;\n    Node* lptr = nullptr;\n    do {\n        swapped = false;\n        ptr1 = head;\n        while (ptr1->next != lptr) {\n            if (ptr1->data > ptr1->next->data) {\n                swap(ptr1->data, ptr1->next->data);\n                swapped = true;\n            }\n            ptr1 = ptr1->next;\n        }\n        lptr = ptr1;\n    } while (swapped);\n}',
                    'python': '# Bubble Sort\ndef bubble_sort(self):\n    if not self.head: return\n    swapped = True\n    while swapped:\n        swapped = False\n        current = self.head\n        while current.next:\n            if current.data > current.next.data:\n                current.data, current.next.data = current.next.data, current.data\n                swapped = True\n            current = current.next',
                    'java': '// Bubble Sort\nvoid bubbleSort() {\n    if(head == null) return;\n    boolean swapped;\n    Node current;\n    do {\n        swapped = false;\n        current = head;\n        while (current.next != null) {\n            if (current.data > current.next.data) {\n                int t = current.data; current.data = current.next.data; current.next.data = t;\n                swapped = true;\n            }\n            current = current.next;\n        }\n    } while (swapped);\n}',
                    'javascript': '// Bubble Sort\nbubbleSort() {\n    if(!this.head) return;\n    let swapped;\n    do {\n        swapped = false;\n        let current = this.head;\n        while (current.next) {\n            if (current.data > current.next.data) {\n                let t = current.data; current.data = current.next.data; current.next.data = t;\n                swapped = true;\n            }\n            current = current.next;\n        }\n    } while (swapped);\n}'
                },
                'Selection Sort': {
                    'cpp': '// Selection Sort\nvoid selectionSort() {\n    Node* temp = head;\n    while (temp) {\n        Node* min = temp;\n        Node* r = temp->next;\n        while (r) {\n            if (min->data > r->data) min = r;\n            r = r->next;\n        }\n        swap(temp->data, min->data);\n        temp = temp->next;\n    }\n}',
                    'python': '# Selection Sort\ndef selection_sort(self):\n    temp = self.head\n    while temp:\n        min_node = temp\n        r = temp.next\n        while r:\n            if min_node.data > r.data: min_node = r\n            r = r.next\n        temp.data, min_node.data = min_node.data, temp.data\n        temp = temp.next',
                    'java': '// Selection Sort\nvoid selectionSort() {\n    Node temp = head;\n    while (temp != null) {\n        Node min = temp;\n        Node r = temp.next;\n        while (r != null) {\n            if (min.data > r.data) min = r;\n            r = r.next;\n        }\n        int x = temp.data; temp.data = min.data; min.data = x;\n        temp = temp.next;\n    }\n}',
                    'javascript': '// Selection Sort\nselectionSort() {\n    let temp = this.head;\n    while (temp) {\n        let min = temp;\n        let r = temp.next;\n        while (r) {\n            if (min.data > r.data) min = r;\n            r = r.next;\n        }\n        let x = temp.data; temp.data = min.data; min.data = x;\n        temp = temp.next;\n    }\n}'
                },
                'Insertion Sort': {
                    'cpp': '// Insertion Sort\nvoid insertionSort() {\n    if (!head || !head->next) return;\n    Node* sorted = nullptr;\n    Node* current = head;\n    while (current != nullptr) {\n        Node* next = current->next;\n        if (sorted == nullptr || sorted->data >= current->data) {\n            current->next = sorted;\n            sorted = current;\n        } else {\n            Node* temp = sorted;\n            while (temp->next != nullptr && temp->next->data < current->data) temp = temp->next;\n            current->next = temp->next;\n            temp->next = current;\n        }\n        current = next;\n    }\n    head = sorted;\n}',
                    'python': '# Insertion Sort\ndef insertion_sort(self):\n    if not self.head or not self.head.next: return\n    sorted_head = None\n    current = self.head\n    while current:\n        nxt = current.next\n        if not sorted_head or sorted_head.data >= current.data:\n            current.next = sorted_head\n            sorted_head = current\n        else:\n            temp = sorted_head\n            while temp.next and temp.next.data < current.data:\n                temp = temp.next\n            current.next = temp.next\n            temp.next = current\n        current = nxt\n    self.head = sorted_head',
                    'java': '// Insertion Sort\nvoid insertionSort() {\n    if (head == null || head.next == null) return;\n    Node sorted = null;\n    Node current = head;\n    while (current != null) {\n        Node next = current.next;\n        if (sorted == null || sorted.data >= current.data) {\n            current.next = sorted;\n            sorted = current;\n        } else {\n            Node temp = sorted;\n            while (temp.next != null && temp.next.data < current.data) temp = temp.next;\n            current.next = temp.next;\n            temp.next = current;\n        }\n        current = next;\n    }\n    head = sorted;\n}',
                    'javascript': '// Insertion Sort\ninsertionSort() {\n    if (!this.head || !this.head.next) return;\n    let sorted = null;\n    let current = this.head;\n    while (current) {\n        let next = current.next;\n        if (!sorted || sorted.data >= current.data) {\n            current.next = sorted;\n            sorted = current;\n        } else {\n            let temp = sorted;\n            while (temp.next && temp.next.data < current.data) temp = temp.next;\n            current.next = temp.next;\n            temp.next = current;\n        }\n        current = next;\n    }\n    this.head = sorted;\n}'
                },
                'Quick Sort': {
                    'cpp': '// Quick Sort (Value Swapping)\nNode* partition(Node* head, Node* tail) {\n    Node* pivot = head;\n    Node* curr = head->next;\n    Node* prev = head;\n    while (curr != tail->next) {\n        if (curr->data < pivot->data) {\n            swap(prev->next->data, curr->data);\n            prev = prev->next;\n        }\n        curr = curr->next;\n    }\n    swap(pivot->data, prev->data);\n    return prev;\n}\n\nvoid quickSortRec(Node* head, Node* tail) {\n    if (!head || head == tail) return;\n    Node* pivot = partition(head, tail);\n    if (pivot != head) {\n        Node* temp = head;\n        while (temp->next != pivot) temp = temp->next;\n        quickSortRec(head, temp);\n    }\n    quickSortRec(pivot->next, tail);\n}',
                    'python': '# Quick Sort (Value Swapping)\ndef partition(head, tail):\n    pivot = head\n    curr = head.next\n    prev = head\n    while curr != tail.next:\n        if curr.data < pivot.data:\n            prev.next.data, curr.data = curr.data, prev.next.data\n            prev = prev.next\n        curr = curr.next\n    pivot.data, prev.data = prev.data, pivot.data\n    return prev\n\ndef quick_sort_rec(head, tail):\n    if not head or head == tail: return\n    pivot = partition(head, tail)\n    if pivot != head:\n        temp = head\n        while temp.next != pivot: temp = temp.next\n        quick_sort_rec(head, temp)\n    quick_sort_rec(pivot.next, tail)',
                    'java': '// Quick Sort (Value Swapping)\nNode partition(Node head, Node tail) {\n    Node pivot = head;\n    Node curr = head.next;\n    Node prev = head;\n    while (curr != tail.next) {\n        if (curr.data < pivot.data) {\n            int temp = prev.next.data; prev.next.data = curr.data; curr.data = temp;\n            prev = prev.next;\n        }\n        curr = curr.next;\n    }\n    int temp = pivot.data; pivot.data = prev.data; prev.data = temp;\n    return prev;\n}\n\nvoid quickSortRec(Node head, Node tail) {\n    if (head == null || head == tail) return;\n    Node pivot = partition(head, tail);\n    if (pivot != head) {\n        Node temp = head;\n        while (temp.next != pivot) temp = temp.next;\n        quickSortRec(head, temp);\n    }\n    quickSortRec(pivot.next, tail);\n}',
                    'javascript': '// Quick Sort (Value Swapping)\npartition(head, tail) {\n    let pivot = head;\n    let curr = head.next;\n    let prev = head;\n    while (curr !== tail.next) {\n        if (curr.data < pivot.data) {\n            let temp = prev.next.data; prev.next.data = curr.data; curr.data = temp;\n            prev = prev.next;\n        }\n        curr = curr.next;\n    }\n    let temp = pivot.data; pivot.data = prev.data; prev.data = temp;\n    return prev;\n}\n\nquickSortRec(head, tail) {\n    if (!head || head === tail) return;\n    let pivot = this.partition(head, tail);\n    if (pivot !== head) {\n        let temp = head;\n        while (temp.next !== pivot) temp = temp.next;\n        this.quickSortRec(head, temp);\n    }\n    this.quickSortRec(pivot.next, tail);\n}'
                }
            }
        },
        'circular-linked-list': {
            'add_head': {
                'cpp': 'Node* add_head(Node* head, int data) {\n    Node* new_node = new Node(data);\n    if (head == nullptr) {\n        new_node->next = new_node;\n        return new_node;\n    }\n    Node* current = head;\n    while (current->next != head) {\n        current = current->next;\n    }\n    new_node->next = head;\n    current->next = new_node;\n    return new_node;\n}',
                'python': 'def add_head(head, data):\n    new_node = Node(data)\n    if head is None:\n        new_node.next = new_node\n        return new_node\n    current = head\n    while current.next != head:\n        current = current.next\n    new_node.next = head\n    current.next = new_node\n    return new_node',
                'java': 'Node addHead(Node head, int data) {\n    Node newNode = new Node(data);\n    if (head == null) {\n        newNode.next = newNode;\n        return newNode;\n    }\n    Node current = head;\n    while (current.next != head) {\n        current = current.next;\n    }\n    newNode.next = head;\n    current.next = newNode;\n    return newNode;\n}',
                'javascript': 'addHead(head, data) {\n    let newNode = new Node(data);\n    if (head === null) {\n        newNode.next = newNode;\n        return newNode;\n    }\n    let current = head;\n    while (current.next !== head) {\n        current = current.next;\n    }\n    newNode.next = head;\n    current.next = newNode;\n    return newNode;\n}'
            },
            'add_tail': {
                'cpp': 'void add_tail(int data) {\n    Node* new_node = new Node(data);\n    if (head == nullptr) {\n        head = new_node;\n        new_node->next = head;\n        return;\n    }\n    Node* temp = head;\n    while (temp->next != head) {\n        temp = temp->next;\n    }\n    temp->next = new_node;\n    new_node->next = head;\n}',
                'python': 'def add_tail(self, data):\n    new_node = Node(data)\n    if self.head is None:\n        self.head = new_node\n        new_node.next = self.head\n        return\n    temp = self.head\n    while temp.next != self.head:\n        temp = temp.next\n    temp.next = new_node\n    new_node.next = self.head',
                'java': 'void add_tail(int data) {\n    Node new_node = new Node(data);\n    if (head == null) {\n        head = new_node;\n        new_node.next = head;\n        return;\n    }\n    Node temp = head;\n    while (temp.next != head) {\n        temp = temp.next;\n    }\n    temp.next = new_node;\n    new_node.next = head;\n}',
                'javascript': 'add_tail(data) {\n    let new_node = new Node(data);\n    if (this.head === null) {\n        this.head = new_node;\n        new_node.next = this.head;\n        return;\n    }\n    let temp = this.head;\n    while (temp.next !== this.head) {\n        temp = temp.next;\n    }\n    temp.next = new_node;\n    new_node.next = this.head;\n}'
            },
            'insert_at': {
                'cpp': 'void insert_at(int position, int data) {\n    if (position < 0) {\n        std::cout << "Invalid position." << std::endl;\n        return;\n    }\n    Node* new_node = new Node(data);\n    if (head == nullptr) {\n        if (position == 0) {\n            head = new_node;\n            new_node->next = head;\n        } else {\n            std::cout << "Position " << position << " is out of bounds for an empty list." << std::endl;\n            delete new_node;\n        }\n        return;\n    }\n    if (position == 0) {\n        Node* temp = head;\n        while (temp->next != head) {\n            temp = temp->next;\n        }\n        new_node->next = head;\n        temp->next = new_node;\n        head = new_node;\n        return;\n    }\n    Node* temp = head;\n    int current_pos = 0;\n    while (current_pos < position - 1) {\n        temp = temp->next;\n        current_pos++;\n        if (temp == head) {\n            std::cout << "Position " << position << " is out of bounds." << std::endl;\n            delete new_node;\n            return;\n        }\n    }\n    new_node->next = temp->next;\n    temp->next = new_node;\n}',
                'python': 'def insert_at(self, position, data):\n    if position < 0:\n        print("Invalid position.")\n        return\n    new_node = Node(data)\n    if self.head is None:\n        if position == 0:\n            self.head = new_node\n            new_node.next = self.head\n        else:\n            print(f"Position {position} is out of bounds for an empty list.")\n        return\n    if position == 0:\n        temp = self.head\n        while temp.next != self.head:\n            temp = temp.next\n        new_node.next = self.head\n        temp.next = new_node\n        self.head = new_node\n        return\n    temp = self.head\n    current_pos = 0\n    while current_pos < position - 1:\n        temp = temp.next\n        current_pos += 1\n        if temp == self.head:\n            print(f"Position {position} is out of bounds.")\n            return\n    new_node.next = temp.next\n    temp.next = new_node',
                'java': 'void insert_at(int position, int data) {\n    if (position < 0) {\n        System.out.println("Invalid position.");\n        return;\n    }\n    Node new_node = new Node(data);\n    if (head == null) {\n        if (position == 0) {\n            head = new_node;\n            new_node.next = head;\n        } else {\n            System.out.println("Position " + position + " is out of bounds for an empty list.");\n        }\n        return;\n    }\n    if (position == 0) {\n        Node temp = head;\n        while (temp.next != head) {\n            temp = temp.next;\n        }\n        new_node.next = head;\n        temp.next = new_node;\n        head = new_node;\n        return;\n    }\n    Node temp = head;\n    int current_pos = 0;\n    while (current_pos < position - 1) {\n        temp = temp.next;\n        current_pos++;\n        if (temp == head) {\n            System.out.println("Position " + position + " is out of bounds.");\n            return;\n        }\n    }\n    new_node.next = temp.next;\n    temp.next = new_node;\n}',
                'javascript': 'insert_at(position, data) {\n    if (position < 0) {\n        console.log("Invalid position.");\n        return;\n    }\n    let new_node = new Node(data);\n    if (this.head === null) {\n        if (position === 0) {\n            this.head = new_node;\n            new_node.next = this.head;\n        } else {\n            console.log(`Position ${position} is out of bounds for an empty list.`);\n        }\n        return;\n    }\n    if (position === 0) {\n        let temp = this.head;\n        while (temp.next !== this.head) {\n            temp = temp.next;\n        }\n        new_node.next = this.head;\n        temp.next = new_node;\n        this.head = new_node;\n        return;\n    }\n    let temp = this.head;\n    let current_pos = 0;\n    while (current_pos < position - 1) {\n        temp = temp.next;\n        current_pos++;\n        if (temp === this.head) {\n            console.log(`Position ${position} is out of bounds.`);\n            return;\n        }\n    }\n    new_node.next = temp.next;\n    temp.next = new_node;\n}'
            },
            'remove_head': {
                'cpp': 'void remove_head() {\n    if (head == nullptr) {\n        std::cout << "List is empty. Nothing to remove." << std::endl;\n        return;\n    }\n    if (head->next == head) {\n        delete head;\n        head = nullptr;\n        return;\n    }\n    Node* old_head = head;\n    Node* last = head;\n    while (last->next != head) {\n        last = last->next;\n    }\n    head = head->next;\n    last->next = head;\n    delete old_head;\n}',
                'python': 'def remove_head(self):\n    if self.head is None:\n        print("List is empty. Nothing to remove.")\n        return\n    if self.head.next == self.head:\n        self.head = None\n        return\n    old_head = self.head\n    last = self.head\n    while last.next != self.head:\n        last = last.next\n    self.head = self.head.next\n    last.next = self.head',
                'java': 'void remove_head() {\n    if (head == null) {\n        System.out.println("List is empty. Nothing to remove.");\n        return;\n    }\n    if (head.next == head) {\n        head = null;\n        return;\n    }\n    Node old_head = head;\n    Node last = head;\n    while (last.next != head) {\n        last = last.next;\n    }\n    head = head.next;\n    last.next = head;\n}',
                'javascript': 'remove_head() {\n    if (this.head === null) {\n        console.log("List is empty. Nothing to remove.");\n        return;\n    }\n    if (this.head.next === this.head) {\n        this.head = null;\n        return;\n    }\n    let old_head = this.head;\n    let last = this.head;\n    while (last.next !== this.head) {\n        last = last.next;\n    }\n    this.head = this.head.next;\n    last.next = this.head;\n}'
            },
            'remove_tail': {
                'cpp': 'void remove_tail() {\n    if (head == nullptr) {\n        std::cout << "List is empty. Nothing to remove." << std::endl;\n        return;\n    }\n    if (head->next == head) {\n        delete head;\n        head = nullptr;\n        return;\n    }\n    Node* temp = head;\n    while (temp->next->next != head) {\n        temp = temp->next;\n    }\n    Node* tail_node = temp->next;\n    temp->next = head;\n    delete tail_node;\n}',
                'python': 'def remove_tail(self):\n    if self.head is None:\n        print("List is empty. Nothing to remove.")\n        return\n    if self.head.next == self.head:\n        self.head = None\n        return\n    temp = self.head\n    while temp.next.next != self.head:\n        temp = temp.next\n    temp.next = self.head',
                'java': 'void remove_tail() {\n    if (head == null) {\n        System.out.println("List is empty. Nothing to remove.");\n        return;\n    }\n    if (head.next == head) {\n        head = null;\n        return;\n    }\n    Node temp = head;\n    while (temp.next.next != head) {\n        temp = temp.next;\n    }\n    temp.next = head;\n}',
                'javascript': 'remove_tail() {\n    if (this.head === null) {\n        console.log("List is empty. Nothing to remove.");\n        return;\n    }\n    if (this.head.next === this.head) {\n        this.head = null;\n        return;\n    }\n    let temp = this.head;\n    while (temp.next.next !== this.head) {\n        temp = temp.next;\n    }\n    temp.next = this.head;\n}'
            },
            'reverse': {
                'cpp': 'void reverse() {\n    if (head == nullptr || head->next == head) {\n        return;\n    }\n    Node* prev = nullptr;\n    Node* current = head;\n    Node* next_node = nullptr;\n    do {\n        next_node = current->next;\n        current->next = prev;\n        prev = current;\n        current = next_node;\n    } while (current != head);\n    head->next = prev;\n    head = prev;\n}',
                'python': 'def reverse(self):\n    if self.head is None or self.head.next == self.head:\n        return\n    prev = None\n    current = self.head\n    next_node = None\n    while True:\n        next_node = current.next\n        current.next = prev\n        prev = current\n        current = next_node\n        if current == self.head:\n            break\n    self.head.next = prev\n    self.head = prev',
                'java': 'void reverse() {\n    if (head == null || head.next == head) {\n        return;\n    }\n    Node prev = null;\n    Node current = head;\n    Node next_node = null;\n    do {\n        next_node = current.next;\n        current.next = prev;\n        prev = current;\n        current = next_node;\n    } while (current != head);\n    head.next = prev;\n    head = prev;\n}',
                'javascript': 'reverse() {\n    if (this.head === null || this.head.next === this.head) {\n        return;\n    }\n    let prev = null;\n    let current = this.head;\n    let next_node = null;\n    do {\n        next_node = current.next;\n        current.next = prev;\n        prev = current;\n        current = next_node;\n    } while (current !== this.head);\n    this.head.next = prev;\n    this.head = prev;\n}'
            },
            'print': {
                'cpp': 'void print() {\n    if (head == nullptr) {\n        std::cout << "List is empty." << std::endl;\n        return;\n    }\n    Node* temp = head;\n    do {\n        std::cout << temp->data << " -> ";\n        temp = temp->next;\n    } while (temp != head);\n    std::cout << "(Back to Head)" << std::endl;\n}',
                'python': 'def print_list(self):\n    if self.head is None:\n        print("List is empty.")\n        return\n    temp = self.head\n    while True:\n        print(f"{temp.data} -> ", end="")\n        temp = temp.next\n        if temp == self.head:\n            break\n    print("(Back to Head)")',
                'java': 'void print() {\n    if (head == null) {\n        System.out.println("List is empty.");\n        return;\n    }\n    Node temp = head;\n    do {\n        System.out.print(temp.data + " -> ");\n        temp = temp.next;\n    } while (temp != head);\n    System.out.println("(Back to Head)");\n}',
                'javascript': 'print() {\n    if (this.head === null) {\n        console.log("List is empty.");\n        return;\n    }\n    let temp = this.head;\n    let str = "";\n    do {\n        str += temp.data + " -> ";\n        temp = temp.next;\n    } while (temp !== this.head);\n    console.log(str + "(Back to Head)");\n}'
            },
            'sort': {
                'Bubble Sort': {
                    'cpp': 'void bubble_sort() {\n    if (head == nullptr || head->next == head) {\n        return;\n    }\n    bool swapped;\n    Node* current;\n    Node* last_sorted = nullptr;\n    do {\n        swapped = false;\n        current = head;\n        while (current->next != last_sorted && current->next != head) {\n            if (current->data > current->next->data) {\n                std::swap(current->data, current->next->data);\n                swapped = true;\n            }\n            current = current->next;\n        }\n        last_sorted = current;\n    } while (swapped);\n}',
                    'python': 'def bubble_sort(self):\n    if self.head is None or self.head.next == self.head:\n        return\n    last_sorted = None\n    swapped = True\n    while swapped:\n        swapped = False\n        current = self.head\n        while current.next != last_sorted and current.next != self.head:\n            if current.data > current.next.data:\n                current.data, current.next.data = current.next.data, current.data\n                swapped = True\n            current = current.next\n        last_sorted = current',
                    'java': 'void bubble_sort() {\n    if (head == null || head.next == head) {\n        return;\n    }\n    boolean swapped;\n    Node current;\n    Node last_sorted = null;\n    do {\n        swapped = false;\n        current = head;\n        while (current.next != last_sorted && current.next != head) {\n            if (current.data > current.next.data) {\n                int temp = current.data;\n                current.data = current.next.data;\n                current.next.data = temp;\n                swapped = true;\n            }\n            current = current.next;\n        }\n        last_sorted = current;\n    } while (swapped);\n}',
                    'javascript': 'bubble_sort() {\n    if (this.head === null || this.head.next === this.head) {\n        return;\n    }\n    let swapped;\n    let current;\n    let last_sorted = null;\n    do {\n        swapped = false;\n        current = this.head;\n        while (current.next !== last_sorted && current.next !== this.head) {\n            if (current.data > current.next.data) {\n                let temp = current.data;\n                current.data = current.next.data;\n                current.next.data = temp;\n                swapped = true;\n            }\n            current = current.next;\n        }\n        last_sorted = current;\n    } while (swapped);\n}'
                },
                'Selection Sort': {
                    'cpp': 'void selection_sort() {\n    if (head == nullptr || head->next == head) {\n        return;\n    }\n    Node* current = head;\n    do {\n        Node* min_node = current;\n        Node* temp = current->next;\n        while (temp != head) {\n            if (temp->data < min_node->data) {\n                min_node = temp;\n            }\n            temp = temp->next;\n        }\n        if (min_node != current) {\n            std::swap(current->data, min_node->data);\n        }\n        current = current->next;\n    } while (current->next != head);\n}',
                    'python': 'def selection_sort(self):\n    if self.head is None or self.head.next == self.head:\n        return\n    current = self.head\n    while True:\n        min_node = current\n        temp = current.next\n        while temp != self.head:\n            if temp.data < min_node.data:\n                min_node = temp\n            temp = temp.next\n        if min_node != current:\n            current.data, min_node.data = min_node.data, current.data\n        current = current.next\n        if current.next == self.head:\n            break',
                    'java': 'void selection_sort() {\n    if (head == null || head.next == head) {\n        return;\n    }\n    Node current = head;\n    do {\n        Node min_node = current;\n        Node temp = current.next;\n        while (temp != head) {\n            if (temp.data < min_node.data) {\n                min_node = temp;\n            }\n            temp = temp.next;\n        }\n        if (min_node != current) {\n            int tmp = current.data;\n            current.data = min_node.data;\n            min_node.data = tmp;\n        }\n        current = current.next;\n    } while (current.next != head);\n}',
                    'javascript': 'selection_sort() {\n    if (this.head === null || this.head.next === this.head) {\n        return;\n    }\n    let current = this.head;\n    do {\n        let min_node = current;\n        let temp = current.next;\n        while (temp !== this.head) {\n            if (temp.data < min_node.data) {\n                min_node = temp;\n            }\n            temp = temp.next;\n        }\n        if (min_node !== current) {\n            let tmp = current.data;\n            current.data = min_node.data;\n            min_node.data = tmp;\n        }\n        current = current.next;\n    } while (current.next !== this.head);\n}'
                },
                'Insertion Sort': {
                    'cpp': 'Node* sortedInsert(Node* sorted_head, Node* new_node) {\n    if (sorted_head == nullptr) {\n        new_node->next = new_node;\n        return new_node;\n    }\n    if (new_node->data <= sorted_head->data) {\n        Node* temp = sorted_head;\n        while (temp->next != sorted_head) {\n            temp = temp->next;\n        }\n        temp->next = new_node;\n        new_node->next = sorted_head;\n        return new_node;\n    }\n    Node* temp = sorted_head;\n    while (temp->next != sorted_head && temp->next->data < new_node->data) {\n        temp = temp->next;\n    }\n    new_node->next = temp->next;\n    temp->next = new_node;\n    return sorted_head;\n}\n\nvoid insertion_sort() {\n    if (head == nullptr || head->next == head) {\n        return;\n    }\n    Node* sorted_head = nullptr;\n    Node* current = head;\n    Node* next_node = nullptr;\n    do {\n        next_node = current->next;\n        sorted_head = sortedInsert(sorted_head, current);\n        current = next_node;\n    } while (current != head);\n    head = sorted_head;\n}',
                    'python': 'def sortedInsert(self, sorted_head, new_node):\n    if sorted_head is None:\n        new_node.next = new_node\n        return new_node\n    if new_node.data <= sorted_head.data:\n        temp = sorted_head\n        while temp.next != sorted_head:\n            temp = temp.next\n        temp.next = new_node\n        new_node.next = sorted_head\n        return new_node\n    temp = sorted_head\n    while temp.next != sorted_head and temp.next.data < new_node.data:\n        temp = temp.next\n    new_node.next = temp.next\n    temp.next = new_node\n    return sorted_head\n\ndef insertion_sort(self):\n    if self.head is None or self.head.next == self.head:\n        return\n    sorted_head = None\n    current = self.head\n    while True:\n        next_node = current.next\n        sorted_head = self.sortedInsert(sorted_head, current)\n        current = next_node\n        if current == self.head:\n            break\n    self.head = sorted_head',
                    'java': 'Node sortedInsert(Node sorted_head, Node new_node) {\n    if (sorted_head == null) {\n        new_node.next = new_node;\n        return new_node;\n    }\n    if (new_node.data <= sorted_head.data) {\n        Node temp = sorted_head;\n        while (temp.next != sorted_head) {\n            temp = temp.next;\n        }\n        temp.next = new_node;\n        new_node.next = sorted_head;\n        return new_node;\n    }\n    Node temp = sorted_head;\n    while (temp.next != sorted_head && temp.next.data < new_node.data) {\n        temp = temp.next;\n    }\n    new_node.next = temp.next;\n    temp.next = new_node;\n    return sorted_head;\n}\n\nvoid insertion_sort() {\n    if (head == null || head.next == head) {\n        return;\n    }\n    Node sorted_head = null;\n    Node current = head;\n    Node next_node = null;\n    do {\n        next_node = current.next;\n        sorted_head = sortedInsert(sorted_head, current);\n        current = next_node;\n    } while (current != head);\n    head = sorted_head;\n}',
                    'javascript': 'sortedInsert(sorted_head, new_node) {\n    if (sorted_head === null) {\n        new_node.next = new_node;\n        return new_node;\n    }\n    if (new_node.data <= sorted_head.data) {\n        let temp = sorted_head;\n        while (temp.next !== sorted_head) {\n            temp = temp.next;\n        }\n        temp.next = new_node;\n        new_node.next = sorted_head;\n        return new_node;\n    }\n    let temp = sorted_head;\n    while (temp.next !== sorted_head && temp.next.data < new_node.data) {\n        temp = temp.next;\n    }\n    new_node.next = temp.next;\n    temp.next = new_node;\n    return sorted_head;\n}\n\ninsertion_sort() {\n    if (this.head === null || this.head.next === this.head) {\n        return;\n    }\n    let sorted_head = null;\n    let current = this.head;\n    let next_node = null;\n    do {\n        next_node = current.next;\n        sorted_head = this.sortedInsert(sorted_head, current);\n        current = next_node;\n    } while (current !== this.head);\n    this.head = sorted_head;\n}'
                },
                'Quick Sort': {
                    'cpp': '// Helper: Find the tail of the circular linked list\nNode* get_tail() {\n    if (head == nullptr) return nullptr;\n    Node* temp = head;\n    while (temp->next != head) {\n        temp = temp->next;\n    }\n    return temp;\n}\n\n// Helper: Partition the list using Lomuto scheme (last element is pivot)\nNode* _partition(Node* start, Node* end) {\n    int pivot = end->data;\n    Node* i = start;\n    for (Node* j = start; j != end; j = j->next) {\n        if (j->data < pivot) {\n            std::swap(i->data, j->data);\n            i = i->next;\n        }\n    }\n    std::swap(i->data, end->data);\n    return i;\n}\n\n// Helper: Recursive Quick Sort\nvoid _quick_sort(Node* start, Node* end) {\n    if (start == nullptr || start == end || start == end->next) {\n        return;\n    }\n    Node* pivot_node = _partition(start, end);\n    if (start != pivot_node) {\n        Node* temp = start;\n        while (temp->next != pivot_node) {\n            temp = temp->next;\n        }\n        _quick_sort(start, temp);\n    }\n    if (pivot_node != end) {\n        _quick_sort(pivot_node->next, end);\n    }\n}\n\n// Main Quick Sort Function\nvoid quick_sort() {\n    if (head == nullptr || head->next == head) {\n        return;\n    }\n    Node* tail = get_tail();\n    _quick_sort(head, tail);\n}',
                    'python': '# Helper: Find the tail of the circular linked list\ndef get_tail(self):\n    if self.head is None:\n        return None\n    temp = self.head\n    while temp.next != self.head:\n        temp = temp.next\n    return temp\n\n# Helper: Partition the list using Lomuto scheme (last element is pivot)\ndef _partition(self, start, end):\n    pivot = end.data\n    i = start\n    j = start\n    while j != end:\n        if j.data < pivot:\n            i.data, j.data = j.data, i.data\n            i = i.next\n        j = j.next\n    i.data, end.data = end.data, i.data\n    return i\n\n# Helper: Recursive Quick Sort\ndef _quick_sort(self, start, end):\n    if start is None or start == end or start == end.next:\n        return\n    pivot_node = self._partition(start, end)\n    if start != pivot_node:\n        temp = start\n        while temp.next != pivot_node:\n            temp = temp.next\n        self._quick_sort(start, temp)\n    if pivot_node != end:\n        self._quick_sort(pivot_node.next, end)\n\n# Main Quick Sort Function\ndef quick_sort(self):\n    if self.head is None or self.head.next == self.head:\n        return\n    tail = self.get_tail()\n    self._quick_sort(self.head, tail)',
                    'java': '// Helper: Find the tail of the circular linked list\nNode get_tail() {\n    if (head == null) return null;\n    Node temp = head;\n    while (temp.next != head) {\n        temp = temp.next;\n    }\n    return temp;\n}\n\n// Helper: Partition the list using Lomuto scheme (last element is pivot)\nNode _partition(Node start, Node end) {\n    int pivot = end.data;\n    Node i = start;\n    for (Node j = start; j != end; j = j.next) {\n        if (j.data < pivot) {\n            int temp = i.data;\n            i.data = j.data;\n            j.data = temp;\n            i = i.next;\n        }\n    }\n    int temp = i.data;\n    i.data = end.data;\n    end.data = temp;\n    return i;\n}\n\n// Helper: Recursive Quick Sort\nvoid _quick_sort(Node start, Node end) {\n    if (start == null || start == end || start == end.next) {\n        return;\n    }\n    Node pivot_node = _partition(start, end);\n    if (start != pivot_node) {\n        Node temp = start;\n        while (temp.next != pivot_node) {\n            temp = temp.next;\n        }\n        _quick_sort(start, temp);\n    }\n    if (pivot_node != end) {\n        _quick_sort(pivot_node.next, end);\n    }\n}\n\n// Main Quick Sort Function\nvoid quick_sort() {\n    if (head == null || head.next == head) {\n        return;\n    }\n    Node tail = get_tail();\n    _quick_sort(head, tail);\n}',
                    'javascript': '// Helper: Find the tail of the circular linked list\nget_tail() {\n    if (this.head === null) return null;\n    let temp = this.head;\n    while (temp.next !== this.head) {\n        temp = temp.next;\n    }\n    return temp;\n}\n\n// Helper: Partition the list using Lomuto scheme (last element is pivot)\n_partition(start, end) {\n    let pivot = end.data;\n    let i = start;\n    for (let j = start; j !== end; j = j.next) {\n        if (j.data < pivot) {\n            let temp = i.data;\n            i.data = j.data;\n            j.data = temp;\n            i = i.next;\n        }\n    }\n    let temp = i.data;\n    i.data = end.data;\n    end.data = temp;\n    return i;\n}\n\n// Helper: Recursive Quick Sort\n_quick_sort(start, end) {\n    if (start === null || start === end || start === end.next) {\n        return;\n    }\n    let pivot_node = this._partition(start, end);\n    if (start !== pivot_node) {\n        let temp = start;\n        while (temp.next !== pivot_node) {\n            temp = temp.next;\n        }\n        this._quick_sort(start, temp);\n    }\n    if (pivot_node !== end) {\n        this._quick_sort(pivot_node.next, end);\n    }\n}\n\n// Main Quick Sort Function\nquick_sort() {\n    if (this.head === null || this.head.next === this.head) {\n        return;\n    }\n    let tail = this.get_tail();\n    this._quick_sort(this.head, tail);\n}'
                }
            }
        },
        'directed-graph': {
            'add_vertex': {
                'cpp': 'void add_vertex(int vertex) {\n    if (adj_list.find(vertex) == adj_list.end()) {\n        adj_list[vertex] = std::vector<int>();\n        std::cout << "Vertex " << vertex << " added successfully.\\n";\n    } else {\n        std::cout << "Vertex " << vertex << " already exists in the graph.\\n";\n    }\n}',
                'python': 'def add_vertex(self, vertex):\n    if vertex not in self.adj_list:\n        self.adj_list[vertex] = []\n        print(f"Vertex {vertex} added successfully.")\n    else:\n        print(f"Vertex {vertex} already exists in the graph.")',
                'java': 'void add_vertex(int vertex) {\n    if (!adj_list.containsKey(vertex)) {\n        adj_list.put(vertex, new ArrayList<Integer>());\n        System.out.println("Vertex " + vertex + " added successfully.");\n    } else {\n        System.out.println("Vertex " + vertex + " already exists in the graph.");\n    }\n}',
                'javascript': 'add_vertex(vertex) {\n    if (!this.adj_list.has(vertex)) {\n        this.adj_list.set(vertex, []);\n        console.log(`Vertex ${vertex} added successfully.\\n`);\n    } else {\n        console.log(`Vertex ${vertex} already exists in the graph.\\n`);\n    }\n}'
            },
            'add_edge': {
                'cpp': 'void add_edge(int source, int destination) {\n    add_vertex(source);\n    add_vertex(destination);\n    adj_list[source].push_back(destination);\n}',
                'python': 'def add_edge(self, source, destination):\n    self.add_vertex(source)\n    self.add_vertex(destination)\n    self.adj_list[source].append(destination)',
                'java': 'void add_edge(int source, int destination) {\n    add_vertex(source);\n    add_vertex(destination);\n    adj_list.get(source).add(destination);\n}',
                'javascript': 'add_edge(source, destination) {\n    this.add_vertex(source);\n    this.add_vertex(destination);\n    this.adj_list.get(source).push(destination);\n}'
            },
            'bfs': {
                'cpp': 'void bfs(int start_vertex) {\n    if (adj_list.find(start_vertex) == adj_list.end()) {\n        std::cout << "Start vertex " << start_vertex << " not found in the graph.\\n";\n        return;\n    }\n    std::unordered_set<int> visited;\n    std::queue<int> q;\n    visited.insert(start_vertex);\n    q.push(start_vertex);\n    std::cout << "BFS Traversal starting from " << start_vertex << ":\\n";\n    while (!q.empty()) {\n        int current = q.front();\n        q.pop();\n        std::cout << current << " ";\n        for (int neighbor : adj_list[current]) {\n            if (visited.find(neighbor) == visited.end()) {\n                visited.insert(neighbor);\n                q.push(neighbor);\n            }\n        }\n    }\n    std::cout << std::endl;\n}',
                'python': 'def bfs(self, start_vertex):\n    if start_vertex not in self.adj_list:\n        print(f"Start vertex {start_vertex} not found in the graph.")\n        return\n    visited = set()\n    queue = [start_vertex]\n    visited.add(start_vertex)\n    print(f"BFS Traversal starting from {start_vertex}:")\n    while queue:\n        current = queue.pop(0)\n        print(current, end=" ")\n        for neighbor in self.adj_list[current]:\n            if neighbor not in visited:\n                visited.add(neighbor)\n                queue.append(neighbor)\n    print()',
                'java': 'void bfs(int start_vertex) {\n    if (!adj_list.containsKey(start_vertex)) {\n        System.out.println("Start vertex " + start_vertex + " not found in the graph.");\n        return;\n    }\n    Set<Integer> visited = new HashSet<>();\n    Queue<Integer> q = new LinkedList<>();\n    visited.add(start_vertex);\n    q.add(start_vertex);\n    System.out.println("BFS Traversal starting from " + start_vertex + ":");\n    while (!q.isEmpty()) {\n        int current = q.poll();\n        System.out.print(current + " ");\n        for (int neighbor : adj_list.get(current)) {\n            if (!visited.contains(neighbor)) {\n                visited.add(neighbor);\n                q.add(neighbor);\n            }\n        }\n    }\n    System.out.println();\n}',
                'javascript': 'bfs(start_vertex) {\n    if (!this.adj_list.has(start_vertex)) {\n        console.log(`Start vertex ${start_vertex} not found in the graph.\\n`);\n        return;\n    }\n    const visited = new Set();\n    const queue = [];\n    visited.add(start_vertex);\n    queue.push(start_vertex);\n    let result = `BFS Traversal starting from ${start_vertex}:\\n`;\n    while (queue.length > 0) {\n        const current = queue.shift();\n        result += current + " ";\n        for (const neighbor of this.adj_list.get(current)) {\n            if (!visited.has(neighbor)) {\n                visited.add(neighbor);\n                queue.push(neighbor);\n            }\n        }\n    }\n    console.log(result + "\\n");\n}'
            },
            'dfs': {
                'cpp': 'void dfs(int node, const std::vector<std::vector<int>>& adj, std::vector<bool>& visited) {\n    visited[node] = true;\n    std::cout << node << " ";\n    for (int neighbor : adj[node]) {\n        if (!visited[neighbor]) {\n            dfs(neighbor, adj, visited);\n        }\n    }\n}',
                'python': 'def dfs(self, node, adj, visited):\n    visited[node] = True\n    print(node, end=" ")\n    for neighbor in adj[node]:\n        if not visited[neighbor]:\n            self.dfs(neighbor, adj, visited)',
                'java': 'void dfs(int node, List<List<Integer>> adj, boolean[] visited) {\n    visited[node] = true;\n    System.out.print(node + " ");\n    for (int neighbor : adj.get(node)) {\n        if (!visited[neighbor]) {\n            dfs(neighbor, adj, visited);\n        }\n    }\n}',
                'javascript': 'dfs(node, adj, visited) {\n    visited[node] = true;\n    console.log(node + " ");\n    for (const neighbor of adj[node]) {\n        if (!visited[neighbor]) {\n            this.dfs(neighbor, adj, visited);\n        }\n    }\n}'
            }
        },
        'undirected-graph': {
            'add_vertex': {
                'cpp': 'void add_vertex() {\n    adj.push_back(std::vector<int>());\n    numVertices++;\n    std::cout << "Added vertex " << numVertices - 1 << std::endl;\n}',
                'python': 'def add_vertex(self):\n    self.adj.append([])\n    self.numVertices += 1\n    print(f"Added vertex {self.numVertices - 1}")',
                'java': 'void add_vertex() {\n    adj.add(new ArrayList<Integer>());\n    numVertices++;\n    System.out.println("Added vertex " + (numVertices - 1));\n}',
                'javascript': 'add_vertex() {\n    this.adj.push([]);\n    this.numVertices++;\n    console.log(`Added vertex ${this.numVertices - 1}\\n`);\n}'
            },
            'add_edge': {
                'cpp': 'void add_edge(int u, int v) {\n    if (u >= numVertices || v >= numVertices || u < 0 || v < 0) {\n        std::cout << "Error: One or both vertices do not exist!" << std::endl;\n        return;\n    }\n    adj[u].push_back(v);\n    adj[v].push_back(u);\n}',
                'python': 'def add_edge(self, u, v):\n    if u >= self.numVertices or v >= self.numVertices or u < 0 or v < 0:\n        print("Error: One or both vertices do not exist!")\n        return\n    self.adj[u].append(v)\n    self.adj[v].append(u)',
                'java': 'void add_edge(int u, int v) {\n    if (u >= numVertices || v >= numVertices || u < 0 || v < 0) {\n        System.out.println("Error: One or both vertices do not exist!");\n        return;\n    }\n    adj.get(u).add(v);\n    adj.get(v).add(u);\n}',
                'javascript': 'add_edge(u, v) {\n    if (u >= this.numVertices || v >= this.numVertices || u < 0 || v < 0) {\n        console.log("Error: One or both vertices do not exist!\\n");\n        return;\n    }\n    this.adj[u].push(v);\n    this.adj[v].push(u);\n}'
            },
            'bfs': {
                'cpp': 'void bfs(int startNode) {\n    if (startNode >= numVertices || startNode < 0) {\n        std::cout << "Error: Starting node does not exist!" << std::endl;\n        return;\n    }\n    std::vector<bool> visited(numVertices, false);\n    std::queue<int> q;\n    visited[startNode] = true;\n    q.push(startNode);\n    std::cout << "Breadth-First Search starting from node " << startNode << ":\\n";\n    while (!q.empty()) {\n        int currentNode = q.front();\n        q.pop();\n        std::cout << currentNode << " ";\n        for (int neighbor : adj[currentNode]) {\n            if (!visited[neighbor]) {\n                visited[neighbor] = true;\n                q.push(neighbor);\n            }\n        }\n    }\n    std::cout << std::endl;\n}',
                'python': 'def bfs(self, startNode):\n    if startNode >= self.numVertices or startNode < 0:\n        print("Error: Starting node does not exist!")\n        return\n    visited = [False] * self.numVertices\n    q = []\n    visited[startNode] = True\n    q.append(startNode)\n    print(f"Breadth-First Search starting from node {startNode}:")\n    while q:\n        currentNode = q.pop(0)\n        print(currentNode, end=" ")\n        for neighbor in self.adj[currentNode]:\n            if not visited[neighbor]:\n                visited[neighbor] = True\n                q.append(neighbor)\n    print()',
                'java': 'void bfs(int startNode) {\n    if (startNode >= numVertices || startNode < 0) {\n        System.out.println("Error: Starting node does not exist!");\n        return;\n    }\n    boolean[] visited = new boolean[numVertices];\n    Queue<Integer> q = new LinkedList<>();\n    visited[startNode] = true;\n    q.add(startNode);\n    System.out.println("Breadth-First Search starting from node " + startNode + ":");\n    while (!q.isEmpty()) {\n        int currentNode = q.poll();\n        System.out.print(currentNode + " ");\n        for (int neighbor : adj.get(currentNode)) {\n            if (!visited[neighbor]) {\n                visited[neighbor] = true;\n                q.add(neighbor);\n            }\n        }\n    }\n    System.out.println();\n}',
                'javascript': 'bfs(startNode) {\n    if (startNode >= this.numVertices || startNode < 0) {\n        console.log("Error: Starting node does not exist!\\n");\n        return;\n    }\n    const visited = new Array(this.numVertices).fill(false);\n    const q = [];\n    visited[startNode] = true;\n    q.push(startNode);\n    let result = `Breadth-First Search starting from node ${startNode}:\\n`;\n    while (q.length > 0) {\n        const currentNode = q.shift();\n        result += currentNode + " ";\n        for (const neighbor of this.adj[currentNode]) {\n            if (!visited[neighbor]) {\n                visited[neighbor] = true;\n                q.push(neighbor);\n            }\n        }\n    }\n    console.log(result + "\\n");\n}'
            },
            'dfs': {
                'cpp': 'void dfs_helper(int currentNode, std::vector<bool>& visited) {\n    visited[currentNode] = true;\n    std::cout << currentNode << " ";\n    for (int neighbor : adj[currentNode]) {\n        if (!visited[neighbor]) {\n            dfs_helper(neighbor, visited);\n        }\n    }\n}\nvoid dfs(int startNode) {\n    if (startNode >= numVertices || startNode < 0) {\n        std::cout << "Error: Starting node does not exist!" << std::endl;\n        return;\n    }\n    std::vector<bool> visited(numVertices, false);\n    std::cout << "Depth-First Search starting from node " << startNode << ":\\n";\n    dfs_helper(startNode, visited);\n    std::cout << std::endl;\n}',
                'python': 'def dfs_helper(self, currentNode, visited):\n    visited[currentNode] = True\n    print(currentNode, end=" ")\n    for neighbor in self.adj[currentNode]:\n        if not visited[neighbor]:\n            self.dfs_helper(neighbor, visited)\n\ndef dfs(self, startNode):\n    if startNode >= self.numVertices or startNode < 0:\n        print("Error: Starting node does not exist!")\n        return\n    visited = [False] * self.numVertices\n    print(f"Depth-First Search starting from node {startNode}:")\n    self.dfs_helper(startNode, visited)\n    print()',
                'java': 'void dfs_helper(int currentNode, boolean[] visited) {\n    visited[currentNode] = true;\n    System.out.print(currentNode + " ");\n    for (int neighbor : adj.get(currentNode)) {\n        if (!visited[neighbor]) {\n            dfs_helper(neighbor, visited);\n        }\n    }\n}\nvoid dfs(int startNode) {\n    if (startNode >= numVertices || startNode < 0) {\n        System.out.println("Error: Starting node does not exist!");\n        return;\n    }\n    boolean[] visited = new boolean[numVertices];\n    System.out.println("Depth-First Search starting from node " + startNode + ":");\n    dfs_helper(startNode, visited);\n    System.out.println();\n}',
                'javascript': 'dfs_helper(currentNode, visited, result) {\n    visited[currentNode] = true;\n    result.push(currentNode);\n    for (const neighbor of this.adj[currentNode]) {\n        if (!visited[neighbor]) {\n            this.dfs_helper(neighbor, visited, result);\n        }\n    }\n}\ndfs(startNode) {\n    if (startNode >= this.numVertices || startNode < 0) {\n        console.log("Error: Starting node does not exist!\\n");\n        return;\n    }\n    const visited = new Array(this.numVertices).fill(false);\n    const result = [];\n    this.dfs_helper(startNode, visited, result);\n    console.log(`Depth-First Search starting from node ${startNode}:\\n` + result.join(" ") + "\\n");\n}'
            },
            'binary-search-tree': {
                'insert': {
                    'cpp': 'Node* insert_helper(Node* node, int val) {\n    if (node == nullptr) {\n        return new Node(val);\n    }\n    if (val < node->data) {\n        node->left = insert_helper(node->left, val);\n    }\n    else if (val > node->data) {\n        node->right = insert_helper(node->right, val);\n    }\n    return node;\n}\nvoid in_order_helper(Node* node) {\n    if (node != nullptr) {\n        in_order_helper(node->left);\n        std::cout << node->data << " ";\n        in_order_helper(node->right);\n    }\n}\nvoid insert(int val) {\n    root = insert_helper(root, val);\n}\nvoid print_in_order() {\n    std::cout << "In-Order Traversal: ";\n    in_order_helper(root);\n    std::cout << std::endl;\n}',
                    'python': 'def insert_helper(self, node, val):\n    if node is None:\n        return Node(val)\n    if val < node.data:\n        node.left = self.insert_helper(node.left, val)\n    elif val > node.data:\n        node.right = self.insert_helper(node.right, val)\n    return node\n\ndef in_order_helper(self, node):\n    if node is not None:\n        self.in_order_helper(node.left)\n        print(node.data, end=" ")\n        self.in_order_helper(node.right)\n\ndef insert(self, val):\n    self.root = self.insert_helper(self.root, val)\n\ndef print_in_order(self):\n    print("In-Order Traversal: ", end="")\n    self.in_order_helper(self.root)\n    print()',
                    'java': 'Node insert_helper(Node node, int val) {\n    if (node == null) {\n        return new Node(val);\n    }\n    if (val < node.data) {\n        node.left = insert_helper(node.left, val);\n    } else if (val > node.data) {\n        node.right = insert_helper(node.right, val);\n    }\n    return node;\n}\n\nvoid in_order_helper(Node node) {\n    if (node != null) {\n        in_order_helper(node.left);\n        System.out.print(node.data + " ");\n        in_order_helper(node.right);\n    }\n}\n\nvoid insert(int val) {\n    root = insert_helper(root, val);\n}\n\nvoid print_in_order() {\n    System.out.print("In-Order Traversal: ");\n    in_order_helper(root);\n    System.out.println();\n}',
                    'javascript': 'insert_helper(node, val) {\n    if (node === null) {\n        return new Node(val);\n    }\n    if (val < node.data) {\n        node.left = this.insert_helper(node.left, val);\n    } else if (val > node.data) {\n        node.right = this.insert_helper(node.right, val);\n    }\n    return node;\n}\n\nin_order_helper(node, result) {\n    if (node !== null) {\n        this.in_order_helper(node.left, result);\n        result.push(node.data);\n        this.in_order_helper(node.right, result);\n    }\n}\n\ninsert(val) {\n    this.root = this.insert_helper(this.root, val);\n}\n\nprint_in_order() {\n    const result = [];\n    this.in_order_helper(this.root, result);\n    console.log("In-Order Traversal: " + result.join(" ") + "\\n");\n}'
                }
            }
        }
    };

    // =========================================================
    // 8. Відмальовка Палітри (Render Palette)
    // =========================================================
    // Ця функція дивиться, яка зараз структура (напр. Графи), і створює для
    // лівої колонки тільки ті блоки, які стосуються Графів (додати ребро, BFS).
    function getCategory(struct) {
        if (struct.includes('list')) return 'linked-list';
        if (struct.includes('graph')) return 'graph';
        if (struct.includes('tree')) return 'tree';
        return 'linked-list';
    }

    function renderPalette() {
        paletteContainer.innerHTML = '';
        const cat = getCategory(currentStructure);
        blockTypes[cat].forEach(b => {
            const blockObj = document.createElement('div');
            blockObj.className = `block ${b.type}`;
            
            // Info button for code
            const infoBtn = document.createElement('span');
            infoBtn.textContent = ' ℹ ';
            infoBtn.style.marginRight = '8px';
            infoBtn.style.background = 'rgba(0,0,0,0.2)';
            infoBtn.style.borderRadius = '50%';
            infoBtn.style.width = '20px';
            infoBtn.style.height = '20px';
            infoBtn.style.display = 'inline-flex';
            infoBtn.style.alignItems = 'center';
            infoBtn.style.justifyContent = 'center';
            infoBtn.style.fontSize = '12px';
            infoBtn.title = 'View Code';
            
            infoBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openModal(b.id);
            });

            blockObj.appendChild(infoBtn);
            
            const textNode1 = document.createTextNode(b.label + '(');
            blockObj.appendChild(textNode1);

            if (b.inputs) {
                b.inputs.forEach((inpName, i) => {
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.step = 'any';
                    input.className = 'block-input palette-input';
                    input.placeholder = inpName;
                    input.addEventListener('click', e => e.stopPropagation());
                    blockObj.appendChild(input);
                    if (i < b.inputs.length - 1) {
                        blockObj.appendChild(document.createTextNode(', '));
                    }
                });
            }

            if (b.hasSelect) {
                const select = document.createElement('select');
                select.className = 'block-input palette-input';
                select.style.width = 'auto';
                b.options.forEach(opt => {
                    const option = document.createElement('option');
                    option.value = opt;
                    option.textContent = opt;
                    select.appendChild(option);
                });
                select.addEventListener('click', e => e.stopPropagation());
                blockObj.appendChild(select);
            }

            const textNode2 = document.createTextNode(')');
            blockObj.appendChild(textNode2);

            blockObj.addEventListener('click', () => {
                let vals = [];
                if (b.inputs) {
                    const inputs = blockObj.querySelectorAll('input');
                    inputs.forEach(inp => vals.push(inp.value));
                }
                if (b.hasSelect) {
                    vals.push(blockObj.querySelector('select')?.value || b.options[0]);
                }
                addBlockToWorkspace(b, vals);
            });

            paletteContainer.appendChild(blockObj);
        });
    }

    // =========================================================
    // 9. Робоча Область та Збереження (Workspace Logic & LocalStorage)
    // =========================================================
    // Тут знаходяться найважливіші функції для роботи з блоками користувача:
    // - addBlockToWorkspace: Додає скопійований блок у праву частину і додає йому стрілочки.
    // - saveScript: Перетворює всі зібрані блоки у текст (JSON) і зберігає у пам'ять браузера.
    // - loadScript: Читає пам'ять і відновлює всі блоки при відкритті сторінки.
    function saveScript() {
        if (!workspaceContainer) return;
        const blocks = Array.from(workspaceContainer.querySelectorAll('.workspace-block'));
        const scriptData = blocks.map(block => {
            const blockId = block.dataset.blockId;
            const inputs = Array.from(block.querySelectorAll('input')).map(inp => inp.value);
            const select = block.querySelector('select');
            if (select) inputs.push(select.value);
            return { id: blockId, values: inputs };
        });
        localStorage.setItem('structvis_script_' + currentStructure, JSON.stringify(scriptData));
    }

    function loadScript() {
        workspaceContainer.innerHTML = '';
        const saved = localStorage.getItem('structvis_script_' + currentStructure);
        if (saved) {
            try {
                const scriptData = JSON.parse(saved);
                if (scriptData.length > 0) {
                    const category = currentStructure.includes('list') ? 'linked-list' : 
                                     currentStructure.includes('tree') ? 'tree' : 'graph';
                    scriptData.forEach(item => {
                        const blockDef = blockTypes[category].find(b => b.id === item.id);
                        if (blockDef) {
                            addBlockToWorkspace(blockDef, item.values, true);
                        }
                    });
                    return;
                }
            } catch(e) { console.error(e); }
        }
        const t = translations[currentLang];
        workspaceContainer.innerHTML = `<p class="empty-text">${t.empty_workspace || 'Click a block above to add it here...'}</p>`;
    }

    function addBlockToWorkspace(blockDef, defaultVals, skipSave = false) {
        const emptyText = workspaceContainer.querySelector('.empty-text');
        if (emptyText) emptyText.remove();

        const blockObj = document.createElement('div');
        blockObj.className = `block ${blockDef.type} workspace-block`;
        blockObj.dataset.blockId = blockDef.id;
        
        const textNode1 = document.createTextNode(blockDef.label + '(');
        blockObj.appendChild(textNode1);

        if (blockDef.inputs) {
            blockDef.inputs.forEach((inpName, i) => {
                const input = document.createElement('input');
                input.type = 'number';
                input.step = 'any';
                input.className = 'block-input';
                input.placeholder = inpName;
                input.value = Array.isArray(defaultVals) ? (defaultVals[i] || '') : (defaultVals || '');
                blockObj.appendChild(input);
                if (i < blockDef.inputs.length - 1) {
                    blockObj.appendChild(document.createTextNode(', '));
                }
            });
        }

        if (blockDef.hasSelect) {
            const select = document.createElement('select');
            select.className = 'block-input';
            select.style.width = 'auto';
            const sVal = Array.isArray(defaultVals) ? defaultVals[defaultVals.length - 1] : defaultVals;
            blockDef.options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt;
                option.textContent = opt;
                if (opt === sVal) option.selected = true;
                select.appendChild(option);
            });
            blockObj.appendChild(select);
        }

        const textNode2 = document.createTextNode(')');
        blockObj.appendChild(textNode2);

        // Controls wrapper
        const controlsDiv = document.createElement('div');
        controlsDiv.style.display = 'flex';
        controlsDiv.style.alignItems = 'center';
        controlsDiv.style.marginLeft = 'auto'; // push to the right

        // Up button
        const upBtn = document.createElement('button');
        upBtn.className = 'block-action-btn';
        upBtn.innerHTML = '&#9650;';
        upBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const prev = blockObj.previousElementSibling;
            if (prev && prev.classList.contains('workspace-block')) {
                workspaceContainer.insertBefore(blockObj, prev);
                saveScript();
                stepIndex = 0;
            }
        });

        // Down button
        const downBtn = document.createElement('button');
        downBtn.className = 'block-action-btn';
        downBtn.innerHTML = '&#9660;';
        downBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const next = blockObj.nextElementSibling;
            if (next && next.classList.contains('workspace-block')) {
                workspaceContainer.insertBefore(next, blockObj);
                saveScript();
                stepIndex = 0;
            }
        });

        // Delete button
        const delBtn = document.createElement('button');
        delBtn.className = 'block-delete';
        delBtn.innerHTML = '&times;';
        delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            blockObj.remove();
            if (workspaceContainer.children.length === 0) {
                const t = translations[currentLang];
                workspaceContainer.innerHTML = `<p class="empty-text">${t.empty_workspace || 'Click a block above to add it here...'}</p>`;
            }
            saveScript();
            stepIndex = 0; // reset step index
        });
        controlsDiv.appendChild(upBtn);
        controlsDiv.appendChild(downBtn);
        controlsDiv.appendChild(delBtn);
        blockObj.appendChild(controlsDiv);

        workspaceContainer.appendChild(blockObj);
        
        blockObj.querySelectorAll('input, select').forEach(el => {
            el.addEventListener('input', () => saveScript());
            el.addEventListener('change', () => saveScript());
        });

        if (!skipSave) saveScript();
        stepIndex = 0; // reset step if we edit the script
    }

    // =========================================================
    // 10. Модальне Вікно з Кодом (Modal Logic)
    // =========================================================
    // Коли ви натискаєте на кнопку 'i' біля блоку, відкривається вікно.
    // openModal() показує його і вибирає потрібний код (C++, Python і т.д.)
    // з об'єкта codeSnippets, який ми описували вище.
    let currentModalBlockId = null;

    function openModal(blockId) {
        currentModalBlockId = blockId;
        modalTitle.textContent = `Code: ${blockId}()`;
        updateModalCode();
        modal.classList.add('active');
    }

    const languageNote = document.getElementById('language-note');
    const modalDescription = document.getElementById('modal-description');

    function getEducationalNoteHtml(progLang) {
        const langName = progLang === 'python' ? 'Python' : progLang === 'java' ? 'Java' : 'JavaScript';
        
        let textEN = `<strong>💡 Educational Note:</strong> ${langName} uses <em>object references</em> instead of explicit memory pointers (like in C++). However, the conceptual data structure (nodes linking to other nodes in memory) works exactly the same way. The arrows in our visualization perfectly represent these references!`;
        
        let textUA = `<strong>💡 Навчальна замітка:</strong> ${langName} використовує <em>посилання на об'єкти</em> замість явних вказівників на пам'ять (як у C++). Проте концептуально структура даних (вузли, що посилаються один на одного) працює абсолютно так само. Стрілочки у нашій візуалізації ідеально відображають ці посилання!`;

        const content = currentLang === 'uk' ? textUA : textEN;

        return `
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>${content}</div>
            </div>
        `;
    }

    function updateModalCode() {
        if (!currentModalBlockId) return;
        const lang = modalLangSelect.value;
        const algo = modalAlgoSelect.value;
        
        // Show algorithm select only for sort block
        if (currentModalBlockId === 'sort') {
            modalAlgoSelect.style.display = 'block';
        } else {
            modalAlgoSelect.style.display = 'none';
        }
        
        if (lang === 'python' || lang === 'javascript' || lang === 'java') {
            languageNote.style.display = 'block';
            languageNote.innerHTML = getEducationalNoteHtml(lang);
        } else {
            languageNote.style.display = 'none';
        }

        let code = `// Implementation for ${currentModalBlockId} in ${currentStructure}\n// Coming soon...`;
        
        if (blockCodes[currentStructure] && blockCodes[currentStructure][currentModalBlockId]) {
            if (currentModalBlockId === 'sort') {
                code = blockCodes[currentStructure][currentModalBlockId][algo] ? blockCodes[currentStructure][currentModalBlockId][algo][lang] : '// Not implemented';
            } else {
                code = blockCodes[currentStructure][currentModalBlockId][lang] || '// Not implemented';
            }
        } else if (currentStructure === 'doubly-linked-list' && blockCodes['singly-linked-list'][currentModalBlockId]) {
            if (currentModalBlockId === 'sort') {
                code = `// Similar to Singly Linked List.\n` + (blockCodes['singly-linked-list'][currentModalBlockId][algo][lang] || '');
            } else {
                code = `// Similar to Singly Linked List, but update prev pointers too.\n` + (blockCodes['singly-linked-list'][currentModalBlockId][lang] || '');
            }
        }

        modalCodeSnippet.textContent = code;

        const modalDesc = document.getElementById('modal-description');
        if (modalDesc) {
            modalDesc.innerHTML = getAlgorithmDescription(currentModalBlockId, algo, lang);
        }
    }

    function getAlgorithmDescription(blockId, algo, progLang = 'cpp') {
        const descEn = {
            'add_head': (progLang) => {
                if (currentStructure === 'circular-linked-list') {
                    let codeDef, newAlloc, checkEmpty, prepCursor, traverseLoop, linkTail, linkHead, returnNode;
                    switch (progLang) {
                        case 'python':
                            codeDef = `def add_head(head, data):`;
                            newAlloc = `new_node = Node(data)`;
                            checkEmpty = `if head is None:\n    new_node.next = new_node\n    return new_node`;
                            prepCursor = `current = head`;
                            traverseLoop = `while current.next != head:\n    current = current.next`;
                            linkTail = `current.next = new_node`;
                            linkHead = `new_node.next = head`;
                            returnNode = `return new_node`;
                            break;
                        case 'java':
                            codeDef = `Node addHead(Node head, int data)`;
                            newAlloc = `Node newNode = new Node(data);`;
                            checkEmpty = `if (head == null) {\n    newNode.next = newNode;\n    return newNode;\n}`;
                            prepCursor = `Node current = head;`;
                            traverseLoop = `while (current.next != head) {\n    current = current.next;\n}`;
                            linkTail = `current.next = newNode;`;
                            linkHead = `newNode.next = head;`;
                            returnNode = `return newNode;`;
                            break;
                        case 'javascript':
                            codeDef = `addHead(head, data) {`;
                            newAlloc = `let newNode = new Node(data);`;
                            checkEmpty = `if (head === null) {\n    newNode.next = newNode;\n    return newNode;\n}`;
                            prepCursor = `let current = head;`;
                            traverseLoop = `while (current.next !== head) {\n    current = current.next;\n}`;
                            linkTail = `current.next = newNode;`;
                            linkHead = `newNode.next = head;`;
                            returnNode = `return newNode;`;
                            break;
                        case 'cpp':
                        default:
                            codeDef = `Node* add_head(Node* head, int data)`;
                            newAlloc = `Node* new_node = new Node(data);`;
                            checkEmpty = `if (head == nullptr) {\n    new_node->next = new_node;\n    return new_node;\n}`;
                            prepCursor = `Node* current = head;`;
                            traverseLoop = `while (current->next != head) {\n    current = current->next;\n}`;
                            linkTail = `current->next = new_node;`;
                            linkHead = `new_node->next = head;`;
                            returnNode = `return new_node;`;
                            break;
                    }
                    return `<h3>Adding an element to the beginning of a circular list (<code>add_head</code>)</h3>
<p>Imagine a train traveling in a closed circle: its last car is always coupled to the very first one. This is a Circular Linked List.</p>
<p>When we want to add a new car to the beginning of such a train, it is not enough to simply attach it in front of the first car. We absolutely must also find the very last car (the Tail) to detach it from the old Head and re-couple it to our new one!</p>
<h3>How it works step-by-step:</h3>
<ul>
<li><pre><code>${codeDef}\n    ${newAlloc}</code></pre><strong>Creating a new node:</strong> First, the program allocates memory for a new "car" and loads the passed data into it.</li>
<li><pre><code>${checkEmpty}</code></pre><strong>Checking for emptiness (first element):</strong> This is a special scenario. If the circular list does not exist yet (the Head is empty), our new node becomes the very first and only one. To close the circle, it must point... to itself! After that, it becomes the Head, and the operation ends.</li>
<li><pre><code>${prepCursor}\n${traverseLoop}</code></pre><strong>Finding the last element:</strong> If the train already exists, we need to find its end. The program creates a cursor pointer and sends it from the Head throughout the entire list. The cursor steps forward until it finds a car that points to the current Head. This is our Tail.</li>
<li><pre><code>${linkHead}\n${linkTail}</code></pre><strong>Re-coupling the cars:</strong> Now we have everything we need to add. First, we take our new node and point it to the current Head (putting it in front). Then, we take the found Tail and redirect its pointer to our new node (so the ring doesn't break).</li>
<li><pre><code>${returnNode}</code></pre><strong>Updating status:</strong> When all connections are updated, our new node is officially recognized as the new Head of the circular list.</li>
</ul>
<h3>Time complexity:</h3>
<ul>
<li><strong>O(n) (Linear time):</strong> Even though we are adding an element to the very beginning, the execution speed of the algorithm depends on the total number of elements in the ring. This is entirely because we have to traverse the whole list from beginning to end just to find the Tail and update its "coupling". For a list with n elements, it will take n steps. (Note: if we constantly stored a separate pointer to the Tail, this operation could be optimized to instantaneous time O(1)).</li>
</ul>`;
                }

                let codeDef, newVar, newAlloc, nextPtr, headPtr;
                switch (progLang) {
                    case 'python':
                        codeDef = `def add_head(self, data):`;
                        newVar = `new_node`;
                        newAlloc = `new_node = Node(data)`;
                        nextPtr = `new_node.next = self.head`;
                        headPtr = `self.head = new_node`;
                        break;
                    case 'java':
                        codeDef = `void insertAtHead(int val)`;
                        newVar = `newNode`;
                        newAlloc = `Node newNode = new Node(val);`;
                        nextPtr = `newNode.next = head;`;
                        headPtr = `head = newNode;`;
                        break;
                    case 'javascript':
                        codeDef = `addHead(data) {`;
                        newVar = `newNode`;
                        newAlloc = `const newNode = new Node(data);`;
                        nextPtr = `newNode.next = this.head;`;
                        headPtr = `this.head = newNode;`;
                        break;
                    case 'cpp':
                    default:
                        codeDef = `void insertAtHead(int val)`;
                        newVar = `newNode`;
                        newAlloc = `Node* newNode = new Node(val);`;
                        nextPtr = `newNode->next = head;`;
                        headPtr = `head = newNode;`;
                        break;
                }
                return `<h3>Step-by-step code explanation:</h3>
<ul>
<li><code>${codeDef}</code><br>We declare a function that takes one parameter <code>val</code> — this is the value (for example, a number) that we want to store in our new node.</li>
<li><code>${newAlloc}</code><br><strong>Creating a new node.</strong> The program allocates memory for the new element and writes our <code>val</code> into it. At this stage, the new node exists in isolation; it is not yet connected to the main list.</li>
<li><code>${nextPtr}</code><br><strong>Linking the new node to the list.</strong> We take the <code>next</code> pointer of our new node and point it to the current <code>head</code> of the list. In other words, we are saying: "The next element after the new one will be the one that is currently first."</li>
<li><code>${headPtr}</code><br><strong>Updating the Head of the list.</strong> Since our new node is now in front of all the others, we must update the <code>head</code> pointer so that it points to this <code>${newVar}</code>. Now it is officially the first element!</li>
</ul>
<h3>Time complexity: O(1)</h3>
<p>The operation of adding to the beginning is performed in constant time — O(1).<br>This means that the execution speed of this function does not depend on how many elements are already in the list (whether there are 10 or 10 million). We always need to perform only three actions: create a node, redirect one pointer, and update the <code>head</code>. This makes a singly linked list an ideal choice when you need to frequently add elements to the beginning.</p>`;
            },

            'add_tail': (progLang) => {
                if (currentStructure === 'circular-linked-list') {
                    let codeDef, newAlloc, checkEmpty, prepCursor, traverseLoop, linkTail, linkHead;
                    switch (progLang) {
                        case 'python':
                            codeDef = `def add_tail(self, data):`;
                            newAlloc = `new_node = Node(data)`;
                            checkEmpty = `if self.head is None:\n    self.head = new_node\n    new_node.next = self.head\n    return`;
                            prepCursor = `temp = self.head`;
                            traverseLoop = `while temp.next != self.head:\n    temp = temp.next`;
                            linkTail = `temp.next = new_node`;
                            linkHead = `new_node.next = self.head`;
                            break;
                        case 'java':
                            codeDef = `void add_tail(int data)`;
                            newAlloc = `Node new_node = new Node(data);`;
                            checkEmpty = `if (head == null) {\n    head = new_node;\n    new_node.next = head;\n    return;\n}`;
                            prepCursor = `Node temp = head;`;
                            traverseLoop = `while (temp.next != head) {\n    temp = temp.next;\n}`;
                            linkTail = `temp.next = new_node`;
                            linkHead = `new_node.next = head`;
                            break;
                        case 'javascript':
                            codeDef = `add_tail(data) {`;
                            newAlloc = `let new_node = new Node(data);`;
                            checkEmpty = `if (this.head === null) {\n    this.head = new_node;\n    new_node.next = this.head;\n    return;\n}`;
                            prepCursor = `let temp = this.head;`;
                            traverseLoop = `while (temp.next !== this.head) {\n    temp = temp.next;\n}`;
                            linkTail = `temp.next = new_node`;
                            linkHead = `new_node.next = this.head`;
                            break;
                        case 'cpp':
                        default:
                            codeDef = `void add_tail(int data)`;
                            newAlloc = `Node* new_node = new Node(data);`;
                            checkEmpty = `if (head == nullptr) {\n    head = new_node;\n    new_node->next = head;\n    return;\n}`;
                            prepCursor = `Node* temp = head;`;
                            traverseLoop = `while (temp->next != head) {\n    temp = temp->next;\n}`;
                            linkTail = `temp->next = new_node`;
                            linkHead = `new_node->next = head`;
                            break;
                    }
                    return `<h3>Adding an element to the end of a circular list (<code>add_tail</code>)</h3>
<p>As we have already figured out, a circular list is a train traveling in a closed circle, where the last car is always coupled to the first one (the Head). If we want to add a new car to the very end of this train, we need to find the "coupling" point between the end and the beginning, break it, insert our new car, and close the circle again.</p>
<h3>How it works step-by-step:</h3>
<ul>
<li><pre><code>${codeDef}\n    ${newAlloc}</code></pre><strong>Creating a new node:</strong> The algorithm starts by allocating memory for a new "car" and loading the passed information into it.</li>
<li><pre><code>${checkEmpty}</code></pre><strong>Creating the first ring (if the list is empty):</strong> First, the program checks if the train exists at all. If the Head is empty, our new car becomes the very first element. But since the list must be circular, this single car immediately connects to itself (its pointer is directed to itself). At this point, the addition is successfully completed.</li>
<li><pre><code>${prepCursor}\n${traverseLoop}</code></pre><strong>Finding the old Tail:</strong> If there are already other cars in the train, we need to find the very last one. The program creates a temporary cursor, places it on the Head, and begins moving forward. The cursor steps from car to car until it finds the one that points back to the Head. This is our old Tail.</li>
<li><pre><code>${linkTail}</code></pre><strong>Embedding the new car:</strong> Having found the last element, we detach its pointer from the Head and direct it to our new car. Now the new car has become the last in line.</li>
<li><pre><code>${linkHead}</code></pre><strong>Closing the circle:</strong> So that the structure doesn't break and remains circular, we take the pointer of our new (now the last) car and direct it to the Head of the list. The circle is closed again!</li>
</ul>
<h3>Time complexity:</h3>
<ul>
<li><strong>O(n) (Linear time):</strong> Since we only have direct access to the beginning of the list, the algorithm is forced to go through each element to reach the end of the ring. The execution speed directly depends on the number of nodes: the longer the list, the longer the cursor will search for the last element. <em>(A little hint: if the list structure specifically stored an additional constant pointer to the Tail, this operation could be sped up to instantaneous time O(1), as we would no longer have to run through the entire train).</em></li>
</ul>`;
                }

                let codeDef, newAlloc, checkEmpty, prepCursor, traverseLoop, appendNode;
                switch (progLang) {
                    case 'python':
                        codeDef = `def add_tail(self, data):`;
                        newAlloc = `new_node = Node(data)`;
                        checkEmpty = `if not self.head: self.head = new_node; return`;
                        prepCursor = `temp = self.head`;
                        traverseLoop = `while temp.next: temp = temp.next`;
                        appendNode = `temp.next = new_node`;
                        break;
                    case 'java':
                        codeDef = `void insertAtTail(int val)`;
                        newAlloc = `Node newNode = new Node(val);`;
                        checkEmpty = `if (head == null) { head = newNode; return; }`;
                        prepCursor = `Node temp = head;`;
                        traverseLoop = `while (temp.next != null) { temp = temp.next; }`;
                        appendNode = `temp.next = newNode;`;
                        break;
                    case 'javascript':
                        codeDef = `addTail(data) {`;
                        newAlloc = `const newNode = new Node(data);`;
                        checkEmpty = `if (!this.head) { this.head = newNode; return; }`;
                        prepCursor = `let temp = this.head;`;
                        traverseLoop = `while (temp.next) { temp = temp.next; }`;
                        appendNode = `temp.next = newNode;`;
                        break;
                    case 'cpp':
                    default:
                        codeDef = `void insertAtTail(int val)`;
                        newAlloc = `Node* newNode = new Node(val);`;
                        checkEmpty = `if (head == nullptr) { head = newNode; return; }`;
                        prepCursor = `Node* temp = head;`;
                        traverseLoop = `while (temp->next != nullptr) { temp = temp->next; }`;
                        appendNode = `temp->next = newNode;`;
                        break;
                }
                return `<h3>Adding an element to the end (<code>insertAtTail</code>)</h3>
<p>In a singly linked list, each node contains information only about the element that comes immediately after it. Therefore, if we want to add a new node to the very end, having only information about the beginning of the list (the Head), we will have to "traverse" all existing elements, step by step, to find the last one.</p>
<h3>How it works step-by-step:</h3>
<ul>
<li><code>${newAlloc}</code><br><strong>Creating a new node:</strong> First, the program allocates memory for the new element and stores the passed value in it. For now, this node is isolated and is not part of the list.</li>
<li><code>${checkEmpty}</code><br><strong>Checking for an empty list:</strong> Next, the algorithm checks whether the list exists at all. If the Head is empty (the list has no elements), then our new node automatically becomes the first and only element. It is assigned as the Head, and the operation ends there.</li>
<li><code>${prepCursor}</code><br><strong>Preparing to find the end:</strong> If the list already has elements, we need to find the last one. To do this, a temporary "cursor pointer" is created, which we initially set to the Head of the list.</li>
<li><code>${traverseLoop}</code><br><strong>Finding the last element:</strong> A loop is started that checks: does the current node have a connection to the next one? If so, our cursor moves one step forward. This process continues until we reach a node that points nowhere (its link is empty). This is the current end of the list.</li>
<li><code>${appendNode}</code><br><strong>Appending the new node:</strong> When the last element is found, we take its pointer and direct it to our newly created element. Now the new node is successfully attached to the end!</li>
</ul>
<h3>Time complexity:</h3>
<ul>
<li><strong>O(n) for the standard approach:</strong> Since we have to go from the first to the last element, the execution speed of the algorithm depends directly on the length of the list. If there are n elements in the list, the program needs to take n steps.</li>
<li><strong>O(1) with a tail pointer:</strong> If our list structure, in addition to the Head, constantly stored a separate pointer to the Tail (the last element), we could append a new node instantly, avoiding a long search. In this case, the execution speed would be constant and would not depend on the number of elements.</li>
</ul>`;
            },

            'insert_at': (progLang) => {
                if (currentStructure === 'circular-linked-list') {
                    let codeDef, sanityCheck, scenario1, scenario2, scenario3, protection, recoupling;
                    switch (progLang) {
                        case 'python':
                            codeDef = `def insert_at(self, position, data):`;
                            sanityCheck = `if position < 0:\n    print("Invalid position.")\n    return\nnew_node = Node(data)`;
                            scenario1 = `if self.head is None:\n    if position == 0:\n        self.head = new_node\n        new_node.next = self.head\n    else:\n        print(f"Position {position} is out of bounds...")\n    return`;
                            scenario2 = `if position == 0:\n    temp = self.head\n    while temp.next != self.head:\n        temp = temp.next\n    new_node.next = self.head\n    temp.next = new_node\n    self.head = new_node\n    return`;
                            scenario3 = `temp = self.head\ncurrent_pos = 0\nwhile current_pos < position - 1:\n    temp = temp.next\n    current_pos += 1`;
                            protection = `    if temp == self.head:\n        print(f"Position {position} is out of bounds.")\n        return`;
                            recoupling = `new_node.next = temp.next\ntemp.next = new_node`;
                            break;
                        case 'java':
                            codeDef = `void insert_at(int position, int data)`;
                            sanityCheck = `if (position < 0) {\n    System.out.println("Invalid position.");\n    return;\n}\nNode new_node = new Node(data);`;
                            scenario1 = `if (head == null) {\n    if (position == 0) {\n        head = new_node;\n        new_node.next = head;\n    } else {\n        System.out.println("Position " + position + " is out of bounds...");\n    }\n    return;\n}`;
                            scenario2 = `if (position == 0) {\n    Node temp = head;\n    while (temp.next != head) {\n        temp = temp.next;\n    }\n    new_node.next = head;\n    temp.next = new_node;\n    head = new_node;\n    return;\n}`;
                            scenario3 = `Node temp = head;\nint current_pos = 0;\nwhile (current_pos < position - 1) {\n    temp = temp.next;\n    current_pos++;`;
                            protection = `    if (temp == head) {\n        System.out.println("Position " + position + " is out of bounds.");\n        return;\n    }\n}`;
                            recoupling = `new_node.next = temp.next;\ntemp.next = new_node;`;
                            break;
                        case 'javascript':
                            codeDef = `insert_at(position, data) {`;
                            sanityCheck = `if (position < 0) {\n    console.log("Invalid position.");\n    return;\n}\nlet new_node = new Node(data);`;
                            scenario1 = `if (this.head === null) {\n    if (position === 0) {\n        this.head = new_node;\n        new_node.next = this.head;\n    } else {\n        console.log(\`Position \${position} is out of bounds...\`);\n    }\n    return;\n}`;
                            scenario2 = `if (position === 0) {\n    let temp = this.head;\n    while (temp.next !== this.head) {\n        temp = temp.next;\n    }\n    new_node.next = this.head;\n    temp.next = new_node;\n    this.head = new_node;\n    return;\n}`;
                            scenario3 = `let temp = this.head;\nlet current_pos = 0;\nwhile (current_pos < position - 1) {\n    temp = temp.next;\n    current_pos++;`;
                            protection = `    if (temp === this.head) {\n        console.log(\`Position \${position} is out of bounds.\`);\n        return;\n    }\n}`;
                            recoupling = `new_node.next = temp.next;\ntemp.next = new_node;`;
                            break;
                        case 'cpp':
                        default:
                            codeDef = `void insert_at(int position, int data)`;
                            sanityCheck = `if (position < 0) {\n    std::cout << "Invalid position." << std::endl;\n    return;\n}\nNode* new_node = new Node(data);`;
                            scenario1 = `if (head == nullptr) {\n    if (position == 0) {\n        head = new_node;\n        new_node->next = head;\n    } else {\n        std::cout << "Position " << position << " is out of bounds...";\n        delete new_node;\n    }\n    return;\n}`;
                            scenario2 = `if (position == 0) {\n    Node* temp = head;\n    while (temp->next != head) {\n        temp = temp->next;\n    }\n    new_node->next = head;\n    temp->next = new_node;\n    head = new_node;\n    return;\n}`;
                            scenario3 = `Node* temp = head;\nint current_pos = 0;\nwhile (current_pos < position - 1) {\n    temp = temp->next;\n    current_pos++;`;
                            protection = `    if (temp == head) {\n        std::cout << "Position " << position << " is out of bounds.";\n        delete new_node;\n        return;\n    }\n}`;
                            recoupling = `new_node->next = temp->next;\ntemp->next = new_node;`;
                            break;
                    }
                    return `<h3>Inserting an element at a given position in a circular list (<code>insert_at</code>)</h3>
<p>Sometimes there is a need to add a new node (car) not at the very beginning or end, but at a specific place — for example, making it the third or fifth in order. Since our list is circular (the last car is connected to the first), the algorithm must be very careful not to accidentally break this endless circle while making space between the cars or to go endlessly in circles looking for a non-existent place.</p>
<h3>How it works step-by-step:</h3>
<ul>
<li><pre><code>${codeDef}\n    ${sanityCheck}</code></pre><strong>Sanity check:</strong> First of all, the program checks the basic logic: did the user request a negative position (for example, -5)? If so, an error is output, and the process stops. If the position is valid, a new isolated node with the data is created.</li>
<li><pre><code>${scenario1}</code></pre><strong>Scenario 1: The list is empty.</strong> If the train does not exist yet, the only logical place for insertion is the very first position (0). In this case, the new node becomes the Head and immediately connects to itself, forming a mini-ring. If, however, position 10 was requested for an empty list, this is an out-of-bounds error. The algorithm will report it and destroy the new node so as not to clutter the computer's memory.</li>
<li><pre><code>${scenario2}</code></pre><strong>Scenario 2: Insertion at the very beginning (Position 0).</strong> If there are already cars, and we want to insert a new one in front of the very first one, we will have to do some work. It is not enough to simply put the new car in front of the Head. Since the circle is closed, the program sends the cursor to the very end of the list to find the Tail. Having found it, it detaches the Tail from the old Head and re-couples it to our new node. Only after this is the circle considered whole again, and the new node becomes the new Head.</li>
<li><pre><code>${scenario3}</code></pre><strong>Scenario 3: Insertion in the middle (Position &gt; 0).</strong> If the place is somewhere in the middle, the program sends the cursor from the beginning of the list. Its task is to take steps forward and stop exactly at the car that will stand before our new one.</li>
<li><pre><code>${protection}</code></pre><strong>Protection against "running in circles":</strong> While searching for the right place, there is one danger. In a normal list, we simply reach the end and see a "dead end." In a circular list, the cursor can unnoticeably go for a second lap! To prevent this, the algorithm keeps track: if during the stepping we stumble upon the Head again (meaning we went in a circle), and the required position has not been reached — it means the requested place is beyond the actual length of the list. In this case, the operation is canceled.</li>
<li><pre><code>${recoupling}</code></pre><strong>Re-coupling:</strong> If the correct place is found, we take our new node, direct its pointer to the next part of the train, and redirect the car the cursor is on to our new one. The new element is successfully integrated into the ring!</li>
</ul>
<h3>Time complexity:</h3>
<ul>
<li><strong>O(n) for most cases:</strong> The execution speed depends directly on the number of elements and the desired position. If you insert an element in the middle, the program needs to take the corresponding number of steps. If you insert at position 0, the program will have to go through the entire list to find the Tail.</li>
<li><strong>O(1) in an exceptional case:</strong> The operation is performed instantly only when the list is absolutely empty, and we insert an element at the zero position.</li>
</ul>`;
                }

                let codeDef, newAlloc, checkZero, prepCursor, checkBounds, insertNode;
                switch (progLang) {
                    case 'python':
                        codeDef = `def insert_at(self, position, data):`;
                        newAlloc = `new_node = Node(data)`;
                        checkZero = `if position == 0:\n    new_node.next = self.head\n    self.head = new_node\n    return`;
                        prepCursor = `current = self.head\nfor _ in range(position - 1):\n    if current is None: raise IndexError("...")\n    current = current.next`;
                        checkBounds = `if current is None:\n    raise IndexError("Position out of bounds")`;
                        insertNode = `new_node.next = current.next\ncurrent.next = new_node`;
                        break;
                    case 'java':
                        codeDef = `void insertAt(int position, int data)`;
                        newAlloc = `Node newNode = new Node(data);`;
                        checkZero = `if (position == 0) {\n    newNode.next = head;\n    head = newNode;\n    return;\n}`;
                        prepCursor = `Node current = head;\nfor (int i = 0; i < position - 1; i++) {\n    if (current == null) throw new IndexOutOfBoundsException("...");\n    current = current.next;\n}`;
                        checkBounds = `if (current == null) {\n    throw new IndexOutOfBoundsException("Position out of bounds");\n}`;
                        insertNode = `newNode.next = current.next;\ncurrent.next = newNode;`;
                        break;
                    case 'javascript':
                        codeDef = `insertAt(position, data) {`;
                        newAlloc = `const newNode = new Node(data);`;
                        checkZero = `if (position === 0) {\n    newNode.next = this.head;\n    this.head = newNode;\n    return;\n}`;
                        prepCursor = `let current = this.head;\nfor (let i = 0; i < position - 1; i++) {\n    if (current === null) throw new Error("...");\n    current = current.next;\n}`;
                        checkBounds = `if (current === null) {\n    throw new Error("Position out of bounds");\n}`;
                        insertNode = `newNode.next = current.next;\ncurrent.next = newNode;`;
                        break;
                    case 'cpp':
                    default:
                        codeDef = `Node* insert_at(Node* head, int position, int data)`;
                        newAlloc = `Node* new_node = new Node(data);`;
                        checkZero = `if (position == 0) {\n    new_node->next = head;\n    return new_node;\n}`;
                        prepCursor = `Node* current = head;\nfor (int i = 0; i < position - 1; ++i) {\n    if (current == nullptr) throw std::out_of_range("...");\n    current = current->next;\n}`;
                        checkBounds = `if (current == nullptr) {\n    delete new_node;\n    throw std::out_of_range("Position out of bounds");\n}`;
                        insertNode = `new_node->next = current->next;\ncurrent->next = new_node;`;
                        break;
                }
                return `<h3>Inserting an element at a given position (<code>insert_at</code>)</h3>
<p>Sometimes there is a need to add a new node not at the beginning or at the end of the list, but somewhere in the middle — for example, making it the third or fifth in order. In a singly linked list, we cannot simply "jump" to the desired location. We must sequentially traverse from the beginning to find the node that will stand immediately before our new element.</p>
<h3>How it works step-by-step:</h3>
<ul>
<li><pre><code>${newAlloc}</code></pre><strong>Creating a new node:</strong> First, the algorithm allocates memory for a new element and places the passed value into it. For now, this node is isolated from the main list.</li>
<li><pre><code>${checkZero}</code></pre><strong>Checking for insertion at the beginning (position 0):</strong> If the user specified position zero, it means the element should become the very first one. This is the simplest scenario: the new node simply attaches to the current Head of the list and becomes the new Head itself. At this point, the algorithm successfully completes its operation.</li>
<li><pre><code>${prepCursor}</code></pre><strong>Finding the previous element:</strong> If the position is greater than zero, we need to find the place for the "break". To do this, a temporary cursor pointer is used, starting from the Head. It steps forward through the list exactly enough times to stop one step before the target position.</li>
<li><pre><code>${checkBounds}</code></pre><strong>Error protection (out of bounds):</strong> While moving from node to node, the algorithm constantly checks if the list has ended. If you try to insert an element at the 10th position, but there are only three in the list, it is an error. In this case, the program deletes our isolated new node (to prevent a memory leak) and outputs an error message (out of bounds).</li>
<li><pre><code>${insertNode}</code></pre><strong>Embedding the new node:</strong> When the cursor stops at the correct previous element, the "re-coupling of the cars" occurs. First, we take the new node and point it to the part of the list that comes after the cursor. Then, we take the element under the cursor and redirect its pointer to our new node. The chain is successfully linked!</li>
</ul>
<h3>Time complexity:</h3>
<ul>
<li><strong>O(n) for most cases:</strong> The execution speed depends on how deep the desired location is within the list. The higher the insertion position, the more steps the cursor needs to take. In the worst-case scenario, it will have to traverse almost the entire list.</li>
<li><strong>O(1) in the best case:</strong> If you need to insert an element at position 0 (at the very beginning), the operation is performed instantly because we do not need to iterate through other elements.</li>
</ul>`;
            },

            'remove_head': (progLang) => {
                if (currentStructure === 'circular-linked-list') {
                    let codeDef, checkEmpty, singleCar, saveOldHead, findTail, updateHead, closeCircle, clearMemory, gcNote;
                    switch (progLang) {
                        case 'python':
                            codeDef = `def remove_head(self):`;
                            checkEmpty = `if self.head is None:\n    print("List is empty. Nothing to remove.")\n    return`;
                            singleCar = `if self.head.next == self.head:\n    self.head = None\n    return`;
                            saveOldHead = `old_head = self.head\nlast = self.head`;
                            findTail = `while last.next != self.head:\n    last = last.next`;
                            updateHead = `self.head = self.head.next`;
                            closeCircle = `last.next = self.head`;
                            clearMemory = ``;
                            gcNote = ` (handled automatically by Python's Garbage Collector)`;
                            break;
                        case 'java':
                            codeDef = `void remove_head()`;
                            checkEmpty = `if (head == null) {\n    System.out.println("List is empty...");\n    return;\n}`;
                            singleCar = `if (head.next == head) {\n    head = null;\n    return;\n}`;
                            saveOldHead = `Node old_head = head;\nNode last = head;`;
                            findTail = `while (last.next != head) {\n    last = last.next;\n}`;
                            updateHead = `head = head.next;`;
                            closeCircle = `last.next = head;`;
                            clearMemory = ``;
                            gcNote = ` (handled automatically by Java's Garbage Collector)`;
                            break;
                        case 'javascript':
                            codeDef = `remove_head() {`;
                            checkEmpty = `if (this.head === null) {\n    console.log("List is empty...");\n    return;\n}`;
                            singleCar = `if (this.head.next === this.head) {\n    this.head = null;\n    return;\n}`;
                            saveOldHead = `let old_head = this.head;\nlet last = this.head;`;
                            findTail = `while (last.next !== this.head) {\n    last = last.next;\n}`;
                            updateHead = `this.head = this.head.next;`;
                            closeCircle = `last.next = this.head;`;
                            clearMemory = ``;
                            gcNote = ` (handled automatically by JavaScript's Garbage Collector)`;
                            break;
                        case 'cpp':
                        default:
                            codeDef = `void remove_head()`;
                            checkEmpty = `if (head == nullptr) {\n    std::cout << "List is empty...";\n    return;\n}`;
                            singleCar = `if (head->next == head) {\n    delete head;\n    head = nullptr;\n    return;\n}`;
                            saveOldHead = `Node* old_head = head;\nNode* last = head;`;
                            findTail = `while (last->next != head) {\n    last = last->next;\n}`;
                            updateHead = `head = head->next;`;
                            closeCircle = `last->next = head;`;
                            clearMemory = `delete old_head;`;
                            gcNote = ``;
                            break;
                    }
                    const clearMemoryHtml = clearMemory ? `<pre><code>${clearMemory}</code></pre>` : '';
                    return `<h3>Removing an element from the beginning of a circular list (<code>remove_head</code>)</h3>
<p>In a normal linear list, removing the first element is very easy — it is enough to simply say that the list now starts from the second car. But in a circular list, things are a bit more complicated. Since the very last car of the train is always coupled to the very first one, we cannot simply remove the Head. We need to find the Tail and re-couple it to the new Head so that our ring does not break!</p>
<h3>How it works step-by-step:</h3>
<ul>
<li><pre><code>${codeDef}\n    ${checkEmpty}</code></pre><strong>Checking for emptiness:</strong> First of all, the program checks if there is anything to remove at all. If the list is empty (there is no Head), it simply outputs a message that the train does not exist and ends its work.</li>
<li><pre><code>${singleCar}</code></pre><strong>Single-car scenario:</strong> This is a special case. If there is only one element in the list, which is closed on itself (its "successor" is itself), then after its removal, nothing will be left. The program simply destroys this car and officially declares the list empty.</li>
<li><pre><code>${saveOldHead}</code></pre><strong>Preparation for removal (multiple cars):</strong> If there are several cars, we cannot immediately delete the first one. First, the program "remembers" the current Head so that it can properly erase it from memory later.</li>
<li><pre><code>${findTail}</code></pre><strong>Finding the Tail:</strong> The algorithm sends a search cursor from the beginning of the list. This cursor runs through all the cars to the very end until it finds the one whose "coupling" points to our current Head. This is the last car.</li>
<li><pre><code>${updateHead}</code></pre><strong>Updating the Head:</strong> Now we move the "Head of the train" status to the second car. From now on, it is considered the new beginning.</li>
<li><pre><code>${closeCircle}</code></pre><strong>Closing the circle:</strong> We take the found last car and direct its pointer to our new Head. The ring is securely closed again!</li>
<li>${clearMemoryHtml}<strong>Clearing memory:</strong> Only now, when all connections have been updated and the old first car is no longer used by anyone, does the program permanently destroy it, freeing the computer's memory.${gcNote}</li>
</ul>
<h3>Time complexity:</h3>
<ul>
<li><strong>O(n) (Linear time):</strong> Removing from the beginning in a circular list takes more time than in a normal one. The whole problem is in the Tail — to update its "coupling," the program is forced to run through the entire list from the first to the last element. Therefore, for a list with n elements, it will have to make n steps.<br><em>(As with adding, if we constantly stored a separate pointer to the Tail, we would avoid this long search, and the speed would be instantaneous — O(1)).</em></li>
</ul>`;
                }

                let codeDef, checkEmpty, saveOld, updateHead, clearMemory, gcNote;
                switch (progLang) {
                    case 'python':
                        codeDef = `def remove_head(self):`;
                        checkEmpty = `if self.head:`;
                        saveOld = ``;
                        updateHead = `    self.head = self.head.next`;
                        clearMemory = ``;
                        gcNote = ` (handled automatically by Python's Garbage Collector)`;
                        break;
                    case 'java':
                        codeDef = `void removeHead()`;
                        checkEmpty = `if(head != null) {`;
                        saveOld = ``;
                        updateHead = `    head = head.next;`;
                        clearMemory = `}`;
                        gcNote = ` (handled automatically by Java's Garbage Collector)`;
                        break;
                    case 'javascript':
                        codeDef = `removeHead() {`;
                        checkEmpty = `if(this.head) {`;
                        saveOld = ``;
                        updateHead = `    this.head = this.head.next;`;
                        clearMemory = `}`;
                        gcNote = ` (handled automatically by JavaScript's Garbage Collector)`;
                        break;
                    case 'cpp':
                    default:
                        codeDef = `void removeHead()`;
                        checkEmpty = `if(!head) return;`;
                        saveOld = `Node* temp = head;`;
                        updateHead = `head = head->next;`;
                        clearMemory = `delete temp;`;
                        gcNote = ``;
                        break;
                }

                const saveOldHtml = saveOld ? `<pre><code>${saveOld}</code></pre>` : '';
                const clearMemoryHtml = clearMemory && progLang === 'cpp' ? `<pre><code>${clearMemory}</code></pre>` : '';

                return `<h3>Removing an element from the beginning (<code>removeHead</code>)</h3>
<p>Removing the first node (the Head) is one of the fastest basic operations in a singly linked list. Since we always have a direct "entry" into the structure through the Head, we don't need to iterate through or search for anything to detach the very first element.</p>
<h3>How it works step-by-step:</h3>
<ul>
<li><pre><code>${checkEmpty}</code></pre><strong>Checking for emptiness:</strong> First of all, the algorithm always checks if our list is empty. If the Head does not exist (the list is empty), then there is nothing to remove. In this case, the function simply exits to avoid system errors.</li>
<li>${saveOldHtml}<strong>Saving the old beginning:</strong> If there are elements, we need to temporarily remember the node we are going to remove. The program creates a "temporary pointer" and directs it to the current Head. This is done so that we don't "lose" this node in the computer's memory after we detach it from the list.${gcNote}</li>
<li><pre><code>${updateHead}</code></pre><strong>Updating the Head of the list:</strong> Now the actual "detachment" takes place. We take the Head pointer and shift it one step forward — to the element that was second. In other words, we tell the program: "Forget about the old first car; now the train starts from the second one."</li>
<li>${clearMemoryHtml}<strong>Clearing memory:</strong> The old first element is now officially no longer a part of our list. So that it doesn't hang in the system as "dead weight," the program uses the same temporary pointer (from step 2) to permanently destroy this node and free the computer's RAM. This process helps avoid so-called "memory leaks."${gcNote}</li>
</ul>
<h3>Time complexity:</h3>
<ul>
<li><strong>O(1) (Constant time):</strong> The speed of removing an element from the beginning is always the same and instantaneous. The computer doesn't care whether the list has 10 elements or 10 million. Detaching the first node always requires performing only a fixed number of steps: checking the list, moving one pointer, and deleting one object.</li>
</ul>`;
            },

            'remove_tail': (progLang) => {
                if (currentStructure === 'circular-linked-list') {
                    let codeDef, checkEmpty, singleCar, findPenultimate, closeCircle, clearMemory, gcNote;
                    switch (progLang) {
                        case 'python':
                            codeDef = `def remove_tail(self):`;
                            checkEmpty = `if self.head is None:\n    print("List is empty. Nothing to remove.")\n    return`;
                            singleCar = `if self.head.next == self.head:\n    self.head = None\n    return`;
                            findPenultimate = `temp = self.head\nwhile temp.next.next != self.head:\n    temp = temp.next`;
                            closeCircle = `temp.next = self.head`;
                            clearMemory = ``;
                            gcNote = ` (handled automatically by Python's Garbage Collector)`;
                            break;
                        case 'java':
                            codeDef = `void remove_tail()`;
                            checkEmpty = `if (head == null) {\n    System.out.println("List is empty. Nothing to remove.");\n    return;\n}`;
                            singleCar = `if (head.next == head) {\n    head = null;\n    return;\n}`;
                            findPenultimate = `Node temp = head;\nwhile (temp.next.next != head) {\n    temp = temp.next;\n}`;
                            closeCircle = `temp.next = head;`;
                            clearMemory = ``;
                            gcNote = ` (handled automatically by Java's Garbage Collector)`;
                            break;
                        case 'javascript':
                            codeDef = `remove_tail() {`;
                            checkEmpty = `if (this.head === null) {\n    console.log("List is empty. Nothing to remove.");\n    return;\n}`;
                            singleCar = `if (this.head.next === this.head) {\n    this.head = null;\n    return;\n}`;
                            findPenultimate = `let temp = this.head;\nwhile (temp.next.next !== this.head) {\n    temp = temp.next;\n}`;
                            closeCircle = `temp.next = this.head;`;
                            clearMemory = ``;
                            gcNote = ` (handled automatically by JavaScript's Garbage Collector)`;
                            break;
                        case 'cpp':
                        default:
                            codeDef = `void remove_tail()`;
                            checkEmpty = `if (head == nullptr) {\n    std::cout << "List is empty. Nothing to remove." << std::endl;\n    return;\n}`;
                            singleCar = `if (head->next == head) {\n    delete head;\n    head = nullptr;\n    return;\n}`;
                            findPenultimate = `Node* temp = head;\nwhile (temp->next->next != head) {\n    temp = temp->next;\n}\nNode* tail_node = temp->next;`;
                            closeCircle = `temp->next = head;`;
                            clearMemory = `delete tail_node;`;
                            gcNote = ``;
                            break;
                    }
                    const clearMemoryHtml = clearMemory ? `<pre><code>${clearMemory}</code></pre>` : '';
                    return `<h3>Removing an element from the end of a circular list (<code>remove_tail</code>)</h3>
<p>Removing the last element (the Tail) in a circular list is a task that requires us to find the "penultimate" (second-to-last) car. Why this specific one? Because after we detach the last car, it is the penultimate one that must take over its role and close the circle by connecting to the very first car (the Head).</p>
<h3>How it works step-by-step:</h3>
<ul>
<li><pre><code>${codeDef}\n    ${checkEmpty}</code></pre><strong>Checking for emptiness:</strong> As always, the algorithm first makes sure that the train actually exists. If the Head is empty, there is nothing to remove, and the function simply exits.</li>
<li><pre><code>${singleCar}</code></pre><strong>Single-car scenario:</strong> If there is only one car in the list, it is closed on itself. Removing its end means removing the entire train. The program simply destroys this single node and leaves emptiness behind it (the Head becomes empty).</li>
<li><pre><code>${findPenultimate}</code></pre><strong>Finding the penultimate car:</strong> If the train is long, the most interesting part begins. The program launches a cursor from the Head of the list. This cursor constantly "looks two steps ahead." It asks itself: "Is the car that comes after the next one our Head?" If not, the cursor takes a step forward. As soon as the answer becomes "yes," the cursor stops. This means it is standing exactly on the penultimate car.</li>
<li><pre><code>${closeCircle}</code></pre><strong>Closing the new circle:</strong> Now we have access to the penultimate car, and right behind it stands our old Tail. We take the "coupling" of the penultimate car and direct it straight to the Head of the list, ignoring the old last car. The circle is closed again, but without the Tail!</li>
<li>${clearMemoryHtml}<strong>Clearing memory:</strong> The old last car is now isolated from our circular train. So that it doesn't take up unnecessary space, the program permanently destroys it, freeing the computer's RAM.${gcNote}</li>
</ul>
<h3>Time complexity:</h3>
<ul>
<li><strong>O(n) (Linear time):</strong> The execution speed of this operation directly depends on the number of cars. Since we can only move forward, the algorithm is forced to traverse almost the entire train (from the first to the penultimate car) to safely detach the end and close the circle. Therefore, for a list of n elements, it will have to make about n steps.<br><em>(Important remark: unlike operations at the beginning of the list, even if we maintained a constant pointer to the Tail, it would not speed up the removal. To detach the Tail, we still need access to the penultimate element, and we cannot move backward. This operation is only fast in doubly linked lists).</em></li>
</ul>`;
                }

                let codeDef, checkEmpty, checkSingle, findPenultimate, detachTail, gcNote;
                switch (progLang) {
                    case 'python':
                        codeDef = `def remove_tail(self):`;
                        checkEmpty = `if not self.head: return`;
                        checkSingle = `if not self.head.next:\n    self.head = None\n    return`;
                        findPenultimate = `temp = self.head\nwhile temp.next.next:\n    temp = temp.next`;
                        detachTail = `temp.next = None`;
                        gcNote = `(In Python, the detached element is later automatically removed from the computer's memory by the Garbage Collector).`;
                        break;
                    case 'java':
                        codeDef = `void removeTail()`;
                        checkEmpty = `if(head == null) return;`;
                        checkSingle = `if(head.next == null) {\n    head = null;\n    return;\n}`;
                        findPenultimate = `Node temp = head;\nwhile(temp.next.next != null)\n    temp = temp.next;`;
                        detachTail = `temp.next = null;`;
                        gcNote = `(In Java, the detached element is later automatically removed from the computer's memory by the Garbage Collector).`;
                        break;
                    case 'javascript':
                        codeDef = `removeTail() {`;
                        checkEmpty = `if(!this.head) return;`;
                        checkSingle = `if(!this.head.next) {\n    this.head = null;\n    return;\n}`;
                        findPenultimate = `let temp = this.head;\nwhile(temp.next.next)\n    temp = temp.next;`;
                        detachTail = `temp.next = null;`;
                        gcNote = `(In JavaScript, the detached element is later automatically removed from the computer's memory by the Garbage Collector).`;
                        break;
                    case 'cpp':
                    default:
                        codeDef = `void removeTail()`;
                        checkEmpty = `if(!head) return;`;
                        checkSingle = `if(!head->next) {\n    delete head;\n    head = nullptr;\n    return;\n}`;
                        findPenultimate = `Node* temp = head;\nwhile(temp->next->next)\n    temp = temp->next;`;
                        detachTail = `delete temp->next;\ntemp->next = nullptr;`;
                        gcNote = ``;
                        break;
                }

                return `<h3>Removing an element from the end (<code>removeTail</code>)</h3>
<p>Unlike the instant removal from the beginning, removing the last element in a singly linked list is slightly more complicated. The thing is that each node only knows about its "successor". We cannot simply look at the last element and ask, "Who comes before you?" Therefore, we have to go all the way from the beginning to find the penultimate node and detach the end from it.</p>
<h3>How it works step-by-step:</h3>
<ul>
<li><pre><code>${checkEmpty}</code></pre><strong>Checking for emptiness:</strong> First of all, the program checks if there are any elements in the list at all. If the Head is empty, the algorithm simply exits — there is nothing to remove.</li>
<li><pre><code>${checkSingle}</code></pre><strong>Checking for a single element:</strong> Next, we see if our train consists of only one car. If there is nothing else after the Head (the next element is absent), we simply delete this Head. The list becomes completely empty.</li>
<li><pre><code>${findPenultimate}</code></pre><strong>Finding the penultimate element:</strong> If there are two or more elements in the list, the most important part begins. The program creates a "temporary cursor pointer" and begins moving from the first node. The algorithm constantly "looks two steps ahead" and asks: "does the next element have its own next one?". If so — the cursor steps forward. The movement stops exactly at the node followed by the last element.</li>
<li><pre><code>${detachTail}</code></pre><strong>Detaching the Tail:</strong> Having found the penultimate node, we simply "cut" its connection, saying that its pointer is now empty. Thus, the former last element simply falls off the chain. ${gcNote}</li>
</ul>
<h3>Time complexity:</h3>
<ul>
<li><strong>O(n) (Linear time):</strong> The execution speed of this operation directly depends on the number of elements in the list. Since the algorithm is forced to step from the first to the penultimate node, for a list of n elements, it will have to make about n steps.</li>
<li><strong>Why a Tail pointer won't help?</strong> Even if we constantly maintain quick access to the last element (a <code>tail</code> pointer), it will not speed up the removal in a singly linked list. To detach the Tail, we need to update the pointer of the node that comes before it. And since we cannot move backwards, we will have to go from the very beginning again. (This problem is solved in doubly linked lists, where the cars are coupled on both sides).</li>
</ul>`;
            },
            'reverse': (progLang) => {
                if (currentStructure === 'circular-linked-list') {
                    let codeDef, checkNecessity, prep, reverseLoop, closeCircle, updateStatus;
                    switch (progLang) {
                        case 'python':
                            codeDef = `def reverse(self):`;
                            checkNecessity = `if self.head is None or self.head.next == self.head:\n    return`;
                            prep = `prev = None\ncurrent = self.head\nnext_node = None`;
                            reverseLoop = `while True:\n    next_node = current.next\n    current.next = prev\n    prev = current\n    current = next_node\n    if current == self.head:\n        break`;
                            closeCircle = `self.head.next = prev`;
                            updateStatus = `self.head = prev`;
                            break;
                        case 'java':
                            codeDef = `void reverse()`;
                            checkNecessity = `if (head == null || head.next == head) {\n    return;\n}`;
                            prep = `Node prev = null;\nNode current = head;\nNode next_node = null;`;
                            reverseLoop = `do {\n    next_node = current.next;\n    current.next = prev;\n    prev = current;\n    current = next_node;\n} while (current != head);`;
                            closeCircle = `head.next = prev;`;
                            updateStatus = `head = prev;`;
                            break;
                        case 'javascript':
                            codeDef = `reverse() {`;
                            checkNecessity = `if (this.head === null || this.head.next === this.head) {\n    return;\n}`;
                            prep = `let prev = null;\nlet current = this.head;\nlet next_node = null;`;
                            reverseLoop = `do {\n    next_node = current.next;\n    current.next = prev;\n    prev = current;\n    current = next_node;\n} while (current !== this.head);`;
                            closeCircle = `this.head.next = prev;`;
                            updateStatus = `this.head = prev;`;
                            break;
                        case 'cpp':
                        default:
                            codeDef = `void reverse()`;
                            checkNecessity = `if (head == nullptr || head->next == head) {\n    return;\n}`;
                            prep = `Node* prev = nullptr;\nNode* current = head;\nNode* next_node = nullptr;`;
                            reverseLoop = `do {\n    next_node = current->next;\n    current->next = prev;\n    prev = current;\n    current = next_node;\n} while (current != head);`;
                            closeCircle = `head->next = prev;`;
                            updateStatus = `head = prev;`;
                            break;
                    }
                    return `<h3>Reversing a circular list (<code>reverse</code>)</h3>
<p>Reversing a circular list is an advanced task (like a problem with an asterisk). Imagine that our train is traveling in a closed circle clockwise. Our goal is to reverse all the "couplings" between the cars so that the train travels counterclockwise. At the same time, we must be extremely careful not to break our endless circle!</p>
<p>This process is very similar to reversing a standard linear list (we also use three temporary pointers: Previous, Current, and Next), but it has one extremely important final step — properly closing the new circle.</p>
<h3>How it works step-by-step:</h3>
<ul>
<li><pre><code>${codeDef}\n    ${checkNecessity}</code></pre><strong>Checking for necessity:</strong> First, the program sees if it makes sense to do anything. If the train does not exist, or there is only one car in it (which is closed on itself), then there is nothing to reverse — the list looks the same in both directions anyway. The process immediately ends.</li>
<li><pre><code>${prep}</code></pre><strong>Preparing the team of pointers:</strong> If there are many cars, the program creates the three pointers familiar to us. Current is set to the Head of the list (the first car), Previous is initially empty, and Next waits for its turn.</li>
<li><pre><code>${reverseLoop}</code></pre><strong>Reversing in a circle:</strong> The program starts a loop that goes from car to car. For each node, it performs three actions: it "remembers" the next car so as not to lose the way; it detaches the current car and directs its "coupling" backward to the Previous car; and it moves the entire team of pointers one step forward. This process continues until the Current pointer goes through the entire circle and stumbles upon the original Head of the list again.</li>
<li><p><strong>Attention, broken circle!</strong> When the loop ends, all the couplings between the cars are successfully reversed. But there is one problem: our old Head (which has now become the last car) is currently pointing to nowhere, and the circle is broken. At the same time, our Previous pointer is currently standing on the former last car, which should become the new beginning.</p></li>
<li><pre><code>${closeCircle}</code></pre><strong>Final closing (Ring magic):</strong> To form a circle again, we must connect the new end with the new beginning. The program takes the old Head and directs its pointer to the car where the Previous pointer is currently standing. The circle is restored!</li>
<li><pre><code>${updateStatus}</code></pre><strong>Updating status:</strong> Finally, we officially hang the "Head of the train" sign on the exact same car where the Previous pointer is standing. Now our list is completely reversed and is once again a perfect ring.</li>
</ul>
<h3>Time complexity:</h3>
<ul>
<li><strong>O(n) (Linear time):</strong> To change the direction of all cars, it is enough for the algorithm to go around the circle exactly once. It visits each node, changes its pointer, and moves on. Therefore, for a list of n elements, it will need to take n steps. This is a very fast and efficient operation, which moreover does not require creating new cars — we are only reassigning the existing couplings.</li>
</ul>`;
                }

                let codeDef, prep, saveFuture, changeDirection, stepForward, finish;
                switch (progLang) {
                    case 'python':
                        codeDef = `def reverse(self):`;
                        prep = `prev = None\ncurrent = self.head`;
                        saveFuture = `next_node = current.next`;
                        changeDirection = `current.next = prev`;
                        stepForward = `prev = current\ncurrent = next_node`;
                        finish = `self.head = prev`;
                        break;
                    case 'java':
                        codeDef = `void reverse()`;
                        prep = `Node prev = null;\nNode current = head;\nNode next = null;`;
                        saveFuture = `next = current.next;`;
                        changeDirection = `current.next = prev;`;
                        stepForward = `prev = current;\ncurrent = next;`;
                        finish = `head = prev;`;
                        break;
                    case 'javascript':
                        codeDef = `reverse() {`;
                        prep = `let prev = null;\nlet current = this.head;\nlet next = null;`;
                        saveFuture = `next = current.next;`;
                        changeDirection = `current.next = prev;`;
                        stepForward = `prev = current;\ncurrent = next;`;
                        finish = `this.head = prev;`;
                        break;
                    case 'cpp':
                    default:
                        codeDef = `Node* reverse(Node* head)`;
                        prep = `Node* prev = nullptr;\nNode* current = head;\nNode* next = nullptr;`;
                        saveFuture = `next = current->next;`;
                        changeDirection = `current->next = prev;`;
                        stepForward = `prev = current;\ncurrent = next;`;
                        finish = `return prev;`;
                        break;
                }

                return `<h3>Reversing a list (<code>reverse</code>)</h3>
<p>Reversing a singly linked list is one of the most popular classic interview questions. Imagine you need to reverse a train so that the last car becomes the first, and the first becomes the last. Since we can't simply pick up the cars and swap their places, we need to change the direction of all the "couplings" (pointers) between them.</p>
<h3>How it works step-by-step:</h3>
<p>The biggest challenge here is that when we detach a pointer from the next element and point it backward, we lose the connection to the rest of the list. To avoid this, the algorithm simultaneously uses three temporary pointers: Previous (<code>prev</code>), Current (<code>current</code>), and Next (<code>next</code>).</p>
<ul>
<li><pre><code>${prep}</code></pre><strong>Preparation:</strong> At the beginning of the process, we set the Current pointer to the Head of the list (the first element). The Previous pointer is initially empty (since there is nothing before the first element), and we will use the Next pointer a little later.</li>
<li><pre><code>${saveFuture}</code></pre><strong>Saving the future:</strong> The iteration loop begins. Before reversing the pointer of the current node backward, we must maintain access to the rest of the list. Therefore, we "remember" the next element using the Next pointer.</li>
<li><pre><code>${changeDirection}</code></pre><strong>Changing direction:</strong> Now it's safe to act! We take the pointer of our Current node and detach it from the future, directing it backward — to the Previous node. (For the very first node, this connection becomes empty, which makes sense, as it will become the new Tail).</li>
<li><pre><code>${stepForward}</code></pre><strong>Stepping forward:</strong> The reversal of one node is complete. Now our entire team of pointers takes a step forward: Previous takes the place of the Current node, and Current moves to the saved position of the Next node.</li>
<li><pre><code>${finish}</code></pre><strong>Finishing up:</strong> This process (save -> reverse -> step forward) is repeated for each node. The loop stops when the Current pointer goes beyond the bounds of the list (becomes empty). At this exact moment, the Previous pointer will have stopped at the former last element. We simply declare it the new Head!</li>
</ul>
<h3>Time complexity:</h3>
<ul>
<li><strong>O(n) (Linear time):</strong> To reverse the list, the algorithm needs to visit each node exactly once in sequence. The execution speed depends directly on the number of elements: for a list with n elements, the program will make n steps. At the same time, we do not create new copies of the list; we only reassign the existing pointers, making this operation highly memory-efficient.</li>
</ul>`;
            },
                        'print': (progLang) => {
                if (currentStructure === 'circular-linked-list') {
                    let codeDef, checkEmpty, specialStart, readingLoop, finish;
                    switch (progLang) {
                        case 'python':
                            codeDef = `def print_list(self):`;
                            checkEmpty = `if self.head is None:\n    print("List is empty.")\n    return`;
                            specialStart = `temp = self.head`;
                            readingLoop = `while True:\n    print(f"{temp.data} -> ", end="")\n    temp = temp.next\n    if temp == self.head:\n        break`;
                            finish = `print("(Back to Head)")`;
                            break;
                        case 'java':
                            codeDef = `void print()`;
                            checkEmpty = `if (head == null) {\n    System.out.println("List is empty.");\n    return;\n}`;
                            specialStart = `Node temp = head;`;
                            readingLoop = `do {\n    System.out.print(temp.data + " -> ");\n    temp = temp.next;\n} while (temp != head);`;
                            finish = `System.out.println("(Back to Head)");`;
                            break;
                        case 'javascript':
                            codeDef = `print() {`;
                            checkEmpty = `if (this.head === null) {\n    console.log("List is empty.");\n    return;\n}`;
                            specialStart = `let temp = this.head;\nlet str = "";`;
                            readingLoop = `do {\n    str += temp.data + " -> ";\n    temp = temp.next;\n} while (temp !== this.head);`;
                            finish = `console.log(str + "(Back to Head)");`;
                            break;
                        case 'cpp':
                        default:
                            codeDef = `void print()`;
                            checkEmpty = `if (head == nullptr) {\n    std::cout << "List is empty." << std::endl;\n    return;\n}`;
                            specialStart = `Node* temp = head;`;
                            readingLoop = `do {\n    std::cout << temp->data << " -> ";\n    temp = temp->next;\n} while (temp != head);`;
                            finish = `std::cout << "(Back to Head)" << std::endl;`;
                            break;
                    }
                    return `<h3>Printing a circular list to the screen (<code>print</code>)</h3>
<p>Reading a normal list is very simple: we go from the first car and stop when we hit emptiness (the end of the train). But in a circular list, there is no end! If we simply tell the program "go forward until you see emptiness," it will endlessly run in circles, printing the same data over and over, until the computer freezes.</p>
<p>Therefore, we need a special, clever approach: we must remember where we started and stop exactly when we return to the start.</p>
<h3>How it works step-by-step:</h3>
<ul>
<li><pre><code>${codeDef}\n    ${checkEmpty}</code></pre><strong>Checking for emptiness:</strong> First, the algorithm checks if the train exists at all. If the Head is empty, the program simply reports: "The list is empty," and exits.</li>
<li><pre><code>${specialStart}</code></pre><strong>Special start (Algorithm's trick):</strong> The program places the reading cursor on the very first car (the Head). There is a nuance here: if we told the program "move until you are at the Head," it wouldn't even start working because it's already standing on the Head! Therefore, the algorithm uses the "act first, check later" rule.</li>
<li><pre><code>${readingLoop}</code></pre><strong>Reading and stepping:</strong> According to this rule, the program first takes the information from the current car and prints it to the screen (usually drawing an arrow to the next one). Only after the data is read does the cursor take one step forward. <br><strong>Checking for the finish:</strong> After stepping forward, the program asks: "Is the car I am currently standing on our starting Head?". If not, the loop repeats (we read and step further). <br><strong>Completing the circle:</strong> As soon as the cursor takes a step and realizes that it is back at the very first car, the loop stops immediately. We have successfully completed a full circle!</li>
<li><pre><code>${finish}</code></pre><strong>Visual emphasis:</strong> To make it clear to the user that this is not a normal linear list, but a closed ring, at the end the program prints a special message like "(Return to Head)".</li>
</ul>
<h3>Time complexity:</h3>
<ul>
<li><strong>O(n) (Linear time):</strong> The reading speed directly depends on the number of cars in the train. To show the entire list, the cursor needs to enter each car exactly once and make exactly one full circle. So, for a list of n elements, the program will make n steps. This is the optimal and only possible time for this task.</li>
</ul>`;
                }

                let codeDef, prep, loopStart, display, step, finish;
                switch (progLang) {
                    case 'python':
                        codeDef = `def print_list(self):`;
                        prep = `temp = self.head`;
                        loopStart = `while temp:`;
                        display = `print(temp.data, end=" -> ")`;
                        step = `temp = temp.next`;
                        finish = `print("None")`;
                        break;
                    case 'java':
                        codeDef = `void print()`;
                        prep = `Node temp = head;`;
                        loopStart = `while(temp != null) {`;
                        display = `System.out.print(temp.data + " -> ");`;
                        step = `temp = temp.next;\n}`;
                        finish = `System.out.println("null");`;
                        break;
                    case 'javascript':
                        codeDef = `print() {`;
                        prep = `let temp = this.head;\nlet str = "";`;
                        loopStart = `while(temp) {`;
                        display = `str += temp.data + " -> ";`;
                        step = `temp = temp.next;\n}`;
                        finish = `console.log(str + "null");`;
                        break;
                    case 'cpp':
                    default:
                        codeDef = `void print()`;
                        prep = `Node* temp = head;`;
                        loopStart = `while(temp) {`;
                        display = `cout << temp->data << " -> ";`;
                        step = `temp = temp->next;\n}`;
                        finish = `cout << "NULL\\n";`;
                        break;
                }

                return `<h3>Printing the list to the screen (<code>print</code>)</h3>
<p>To see exactly what data is currently stored in our singly linked list, we need to traverse it from the very first element to the very last. Since we only have direct access to the beginning (the Head), the process resembles reading a book: we start from the first page and turn them one by one until we reach the end.</p>
<h3>How it works step-by-step:</h3>
<ul>
<li><pre><code>${prep}</code></pre><strong>Preparing to read:</strong> First, the program creates a "temporary cursor pointer" and sets it to the Head of the list (the first element). This is our starting point.</li>
<li><pre><code>${loopStart}</code></pre><strong>Starting the loop:</strong> Next, a checking loop is started. The algorithm constantly asks: "Is our cursor currently pointing to a real, existing node?". If so, we enter the loop.</li>
<li><pre><code>${display}</code></pre><strong>Displaying the data:</strong> While on a specific node, the program takes the useful information (data) stored in it and prints it to the screen (usually adding a visual arrow "-&gt;" to show the connection).</li>
<li><pre><code>${step}</code></pre><strong>Stepping forward:</strong> After the data is printed, the cursor takes a step forward — it moves to the node that the current element points to.</li>
<li><pre><code>${finish}</code></pre><strong>Finishing up:</strong> This process (read data -&gt; step forward) is repeated until the cursor goes beyond the last node and becomes empty (<code>NULL</code>). When this happens, the loop stops, and the program simply prints the word "NULL" to the screen, signaling that the chain has ended.</li>
</ul>
<h3>Time complexity:</h3>
<ul>
<li><strong>O(n) (Linear time):</strong> The execution speed of this operation is directly proportional to the number of elements in the list. To show all the data, the program is forced to visit absolutely every node exactly once. Accordingly, for a list with n elements, it will have to take n steps and print the information to the screen n times.</li>
</ul>`;
            },
                        'sort': (progLang, algo) => {
                if (currentStructure === 'circular-linked-list') {
                    if (algo === 'Bubble Sort') {
                        let checkEmpty, startPass, compare, shorten, finishSort;
                        switch (progLang) {
                            case 'python':
                                checkEmpty = `if self.head is None or self.head.next == self.head:\n    return`;
                                startPass = `last_sorted = None\nswapped = True\nwhile swapped:\n    swapped = False\n    current = self.head`;
                                compare = `while current.next != last_sorted and current.next != self.head:\n    if current.data > current.next.data:\n        current.data, current.next.data = current.next.data, current.data\n        swapped = True\n    current = current.next`;
                                shorten = `last_sorted = current`;
                                finishSort = `# loop ends automatically when swapped == False`;
                                break;
                            case 'java':
                                checkEmpty = `if (head == null || head.next == head) {\n    return;\n}`;
                                startPass = `boolean swapped;\nNode current;\nNode last_sorted = null;\ndo {\n    swapped = false;\n    current = head;`;
                                compare = `while (current.next != last_sorted && current.next != head) {\n    if (current.data > current.next.data) {\n        int t = current.data;\n        current.data = current.next.data;\n        current.next.data = t;\n        swapped = true;\n    }\n    current = current.next;\n}`;
                                shorten = `last_sorted = current;`;
                                finishSort = `} while (swapped);`;
                                break;
                            case 'javascript':
                                checkEmpty = `if (this.head === null || this.head.next === this.head) {\n    return;\n}`;
                                startPass = `let swapped;\nlet current;\nlet last_sorted = null;\ndo {\n    swapped = false;\n    current = this.head;`;
                                compare = `while (current.next !== last_sorted && current.next !== this.head) {\n    if (current.data > current.next.data) {\n        let t = current.data;\n        current.data = current.next.data;\n        current.next.data = t;\n        swapped = true;\n    }\n    current = current.next;\n}`;
                                shorten = `last_sorted = current;`;
                                finishSort = `} while (swapped);`;
                                break;
                            case 'cpp':
                            default:
                                checkEmpty = `if (head == nullptr || head->next == head) {\n    return;\n}`;
                                startPass = `bool swapped;\nNode* current;\nNode* last_sorted = nullptr;\ndo {\n    swapped = false;\n    current = head;`;
                                compare = `while (current->next != last_sorted && current->next != head) {\n    if (current->data > current->next->data) {\n        std::swap(current->data, current->next->data);\n        swapped = true;\n    }\n    current = current->next;\n}`;
                                shorten = `last_sorted = current;`;
                                finishSort = `} while (swapped);`;
                                break;
                        }
                        return `<h3>Sorting a circular list (Bubble Sort)</h3>
<p>You are already familiar with the "bubble sort" algorithm, where the largest values gradually "float" to the end of the list. For a circular list, the basic principle remains the same: we do not break the couplings between the cars, but simply swap their cargo (data).</p>
<p>However, since our train travels in a closed circle, a new danger arises — the algorithm could endlessly run in circles and never stop! Therefore, we need a reliable "safety catch" that will say in time: "Stop, the circle is complete."</p>
<h3>How it works step-by-step:</h3>
<ul>
<li><pre><code>${checkEmpty}</code></pre><strong>Checking "if there is anything to sort":</strong> If the train does not exist or has only one car, the program immediately ends its work. Such a list is considered sorted a priori.</li>
<li><pre><code>${startPass}</code></pre><strong>Preparing for the lap:</strong> The algorithm creates a cursor and places it on the Head. It also takes a special indicator (a flag) that will record whether we made any cargo swaps during the current lap.</li>
<li><pre><code>${compare}</code></pre><strong>Movement and comparison:</strong> The cursor begins to move. It looks at the cargo in its own car and in the next one. If its cargo is heavier (the number is larger), it swaps their data and turns on the flag. After that, it takes a step forward. <br><strong>Infinity safety catch:</strong> In a normal list, the cursor would stop when it saw emptiness (the end). Here, it stops when it sees that the next car is our Head again! This is a signal that a full circle (of the unsorted part) has been completed. If during the run the scout finds a cargo smaller than our "temporary minimum", it simply remembers the location of this car.</li>
<li><pre><code>${shorten}</code></pre><strong>Smart optimization (Shortening the path):</strong> After the very first full lap, the heaviest cargo is guaranteed to end up in the very last car (right before the Head). To avoid doing unnecessary work, the algorithm remembers this car and places a conditional "stop sign" there. During the second lap, the cursor will no longer go all the way to the Head, but will stop before this sign. With each lap, this "stop sign" will shift closer to the beginning, reducing the route.</li>
<li><pre><code>${finishSort}</code></pre><strong>Perfect order:</strong> The program sends the cursor on new laps over and over until it travels the entire available route without ever turning on the flag (meaning no swaps were made). This means that all the cargo is arranged perfectly!</li>
</ul>
<h3>Time complexity:</h3>
<ul>
<li><strong>O(n²) (Quadratic time) in the worst and average cases:</strong> Even with our "smart optimization," if the cargo is completely mixed up, the algorithm will have to make a lot of laps. For a ring with many cars, this takes a lot of time, so bubble sort remains slow for large volumes of data.</li>
<li><strong>O(n) in the best case:</strong> If you give the program a train where the cargo is already arranged in ascending order, the algorithm will make exactly one lap, see that nothing needs to be changed, and instantly finish its work.</li>
</ul>`;
                    } else if (algo === 'Selection Sort') {
                        let checkEmpty, outerLoop, innerLoop, swapData, moveOuter;
                        switch (progLang) {
                            case 'python':
                                checkEmpty = `if self.head is None or self.head.next == self.head:\n    return`;
                                outerLoop = `current = self.head\nwhile True:\n    min_node = current\n    temp = current.next`;
                                innerLoop = `    while temp != self.head:\n        if temp.data < min_node.data:\n            min_node = temp\n        temp = temp.next`;
                                swapData = `    if min_node != current:\n        current.data, min_node.data = min_node.data, current.data`;
                                moveOuter = `    current = current.next\n    if current.next == self.head:\n        break`;
                                break;
                            case 'java':
                                checkEmpty = `if (head == null || head.next == head) {\n    return;\n}`;
                                outerLoop = `Node current = head;\ndo {\n    Node min_node = current;\n    Node temp = current.next;`;
                                innerLoop = `    while (temp != head) {\n        if (temp.data < min_node.data) {\n            min_node = temp;\n        }\n        temp = temp.next;\n    }`;
                                swapData = `    if (min_node != current) {\n        int tmp = current.data;\n        current.data = min_node.data;\n        min_node.data = tmp;\n    }`;
                                moveOuter = `    current = current.next;\n} while (current.next != head);`;
                                break;
                            case 'javascript':
                                checkEmpty = `if (this.head === null || this.head.next === this.head) {\n    return;\n}`;
                                outerLoop = `let current = this.head;\ndo {\n    let min_node = current;\n    let temp = current.next;`;
                                innerLoop = `    while (temp !== this.head) {\n        if (temp.data < min_node.data) {\n            min_node = temp;\n        }\n        temp = temp.next;\n    }`;
                                swapData = `    if (min_node !== current) {\n        let tmp = current.data;\n        current.data = min_node.data;\n        min_node.data = tmp;\n    }`;
                                moveOuter = `    current = current.next;\n} while (current.next !== this.head);`;
                                break;
                            case 'cpp':
                            default:
                                checkEmpty = `if (head == nullptr || head->next == head) {\n    return;\n}`;
                                outerLoop = `Node* current = head;\ndo {\n    Node* min_node = current;\n    Node* temp = current->next;`;
                                innerLoop = `    while (temp != head) {\n        if (temp->data < min_node->data) {\n            min_node = temp;\n        }\n        temp = temp->next;\n    }`;
                                swapData = `    if (min_node != current) {\n        std::swap(current->data, min_node->data);\n    }`;
                                moveOuter = `    current = current->next;\n} while (current->next != head);`;
                                break;
                        }
                        return `<h3>Selection Sort in a circular list</h3>
<p>The "selection sort" algorithm works like a very meticulous loader. Its goal is to find the smallest (lightest) cargo and put it in the first car, then find the next smallest and put it in the second, and so on.</p>
<p>For a circular list, we use the "data swapping" approach: we do not decouple the cars themselves, but simply transfer the boxes with numbers from one car to another. The main difficulty here is to stop the search in time so as not to go for a second lap around our endless ring.</p>
<h3>How it works step-by-step:</h3>
<ul>
<li><pre><code>${checkEmpty}</code></pre><strong>Checking for readiness:</strong> First of all, the program sees if it makes sense to start working. If the train does not exist or has only one car in it, there is nothing to sort — the list is considered perfect by default.</li>
<li><pre><code>${outerLoop}</code></pre><strong>Choosing the "target" car:</strong> The algorithm places the main cursor on the first car (the Head). This cursor marks the car we are currently trying to fill with the smallest available cargo. The program temporarily assumes that the cargo already lying in this car is the smallest.</li>
<li><pre><code>${innerLoop}</code></pre><strong>Launching the scout (Finding the minimum):</strong> Next, the algorithm sends a scout cursor forward. Its task is to run through all subsequent cars and check their cargo. <br><strong>Infinity safety catch:</strong> Since the train is circular, the scout must know where to stop. It runs forward and compares cargoes until it sees that the next car is our starting Head again. This is a signal that a full circle (of the unsorted part) has been completed. If during the run the scout finds a cargo smaller than our "temporary minimum", it simply remembers the location of this car.</li>
<li><pre><code>${swapData}</code></pre><strong>Swapping cargo:</strong> When the scout completes its lap, we know exactly where the smallest cargo lies. If it ended up not being in our "target" car, the program simply swaps their cargoes.</li>
<li><pre><code>${moveOuter}</code></pre><strong>Stepping forward:</strong> Now the first car has the perfect cargo and is considered sorted! The main cursor moves to the second car, and the entire search process is repeated. The algorithm stops its work one step before the Head (at the penultimate car) — because if all previous cars are sorted correctly, the last one will automatically be left with the largest cargo.</li>
</ul>
<h3>Time complexity:</h3>
<ul>
<li><strong>O(n²) (Quadratic time) in all cases:</strong> Unlike "bubble" sort, selection sort cannot understand whether the list is already ordered. Even if all cargoes are perfectly arranged from smallest to largest, our scout will still diligently run in a circle at each step to check every single car. Therefore, for a train of n cars, it will always make approximately n × n steps. Because of this, the algorithm is considered slow for large data sets.</li>
</ul>`;
                    } else if (algo === 'Insertion Sort') {
                        let checkEmpty, disassemble, build, stepForward, finishUp;
                        switch (progLang) {
                            case 'python':
                                checkEmpty = `if self.head is None or self.head.next == self.head:\n    return`;
                                disassemble = `sorted_head = None\ncurrent = self.head`;
                                build = `    sorted_head = self.sortedInsert(sorted_head, current)`;
                                stepForward = `    current = next_node\n    if current == self.head:\n        break`;
                                finishUp = `self.head = sorted_head`;
                                break;
                            case 'java':
                                checkEmpty = `if (head == null || head.next == head) {\n    return;\n}`;
                                disassemble = `Node sorted_head = null;\nNode current = head;`;
                                build = `    sorted_head = sortedInsert(sorted_head, current);`;
                                stepForward = `    current = next_node;\n} while (current != head);`;
                                finishUp = `head = sorted_head;`;
                                break;
                            case 'javascript':
                                checkEmpty = `if (this.head === null || this.head.next === this.head) {\n    return;\n}`;
                                disassemble = `let sorted_head = null;\nlet current = this.head;`;
                                build = `    sorted_head = this.sortedInsert(sorted_head, current);`;
                                stepForward = `    current = next_node;\n} while (current !== this.head);`;
                                finishUp = `this.head = sorted_head;`;
                                break;
                            case 'cpp':
                            default:
                                checkEmpty = `if (head == nullptr || head->next == head) {\n    return;\n}`;
                                disassemble = `Node* sorted_head = nullptr;\nNode* current = head;`;
                                build = `    sorted_head = sortedInsert(sorted_head, current);`;
                                stepForward = `    current = next_node;\n} while (current != head);`;
                                finishUp = `head = sorted_head;`;
                                break;
                        }
                        return `<h3>Insertion Sort in a circular list</h3>
<p>The "insertion sort" algorithm resembles the process of taking one card at a time from an unsorted deck and inserting it into the correct place in the fan of cards in your hand.</p>
<p>In the case of a circular list, we literally disassemble our old, unsorted train step by step and simultaneously build a new train from its cars — instantly sorted. Here we don't just swap the cargo; we actually re-couple the cars themselves, ensuring that the new train always remains closed in a ring!</p>
<h3>How it works step-by-step:</h3>
<ul>
<li><pre><code>${checkEmpty}</code></pre><strong>Checking for readiness:</strong> If the train is empty or consists of only one car (which is closed on itself), the program does nothing. Such a list is already considered perfect.</li>
<li><pre><code>${disassemble}</code></pre><strong>Disassembling the old train:</strong> The program creates an empty platform for our future, "sorted" train. Then it approaches the first car of the old train. An important point: before detaching this car, the program absolutely must "remember" which car comes next, so as not to lose the rest of the old train during the disassembly process.</li>
<li><pre><code>${build}</code></pre><strong>Building the new train (Finding a place):</strong> Having detached the car, the algorithm looks at our new train to find the right place for it:<br>
<strong>Scenario A (The new train is empty):</strong> If this is the very first detached car, it becomes the Head of the new train and immediately connects to itself (forming a mini-ring).<br>
<strong>Scenario B (The lightest cargo):</strong> If the cargo in our car is smaller than that of the Head of the new train, it should become the new beginning. But since this is a ring, the program is forced to run all the way to the Tail of the new train to detach it from the old Head and re-couple it to our new car.<br>
<strong>Scenario C (The cargo is in the middle or heavier):</strong> If the car is to be placed somewhere in the middle or at the end, a special cursor runs through the new train, looking for a "gap" where the next car will be heavier than ours. Having found it, it carefully makes space between the coupling and inserts our car there.</li>
<li><pre><code>${stepForward}</code></pre><strong>Stepping forward:</strong> As soon as the car is successfully attached to the new train, the program returns to that "remembered" car from the old train (step 2) and repeats the process.</li>
<li><pre><code>${finishUp}</code></pre><strong>Finishing up:</strong> This cycle of "detach -&gt; find a place -&gt; insert into the ring" continues until the old train is completely disassembled. At the end, we declare our newly built, perfectly sorted train as the main one!</li>
</ul>
<h3>Time complexity:</h3>
<ul>
<li><strong>O(n²) (Quadratic time):</strong> Because we are working with a ring, this algorithm does a lot of running around. For each detached car, the program has to find a place for it in the new train by going through it from the beginning. And if the car turns out to be the smallest (Scenario B), it will have to run all the way to the end of the new train to re-couple the Tail. For long lists, this process takes quite a bit of time.</li>
<li><strong>Advantage:</strong> Despite being slow on large volumes of data, this method works wonderfully and very quickly if the list is already almost sorted from the very beginning, or if there are very few cars.</li>
</ul>`;
                    } else if (algo === 'Quick Sort') {
                        let findTail, choosePivot, partitionLoop, fixPivot, divideConquer, oneWayMovement;
                        switch (progLang) {
                            case 'python':
                                findTail = `def get_tail(self):\n    if self.head is None:\n        return None\n    temp = self.head\n    while temp.next != self.head:\n        temp = temp.next\n    return temp`;
                                choosePivot = `pivot = end.data\ni = start\nj = start`;
                                partitionLoop = `while j != end:\n    if j.data < pivot:\n        i.data, j.data = j.data, i.data\n        i = i.next\n    j = j.next`;
                                fixPivot = `i.data, end.data = end.data, i.data\nreturn i`;
                                divideConquer = `if start != pivot_node:\n    temp = start\n    # ...\n    self._quick_sort(start, temp)\nif pivot_node != end:\n    self._quick_sort(pivot_node.next, end)`;
                                oneWayMovement = `temp = start\nwhile temp.next != pivot_node:\n    temp = temp.next`;
                                break;
                            case 'java':
                                findTail = `Node get_tail() {\n    if (head == null) return null;\n    Node temp = head;\n    while (temp.next != head) {\n        temp = temp.next;\n    }\n    return temp;\n}`;
                                choosePivot = `int pivot = end.data;\nNode i = start;`;
                                partitionLoop = `for (Node j = start; j != end; j = j.next) {\n    if (j.data < pivot) {\n        int temp = i.data;\n        i.data = j.data;\n        j.data = temp;\n        i = i.next;\n    }\n}`;
                                fixPivot = `int temp = i.data;\ni.data = end.data;\nend.data = temp;\nreturn i;`;
                                divideConquer = `if (start != pivot_node) {\n    Node temp = start;\n    // ...\n    _quick_sort(start, temp);\n}\nif (pivot_node != end) {\n    _quick_sort(pivot_node.next, end);\n}`;
                                oneWayMovement = `Node temp = start;\nwhile (temp.next != pivot_node) {\n    temp = temp.next;\n}`;
                                break;
                            case 'javascript':
                                findTail = `get_tail() {\n    if (this.head === null) return null;\n    let temp = this.head;\n    while (temp.next !== this.head) {\n        temp = temp.next;\n    }\n    return temp;\n}`;
                                choosePivot = `let pivot = end.data;\nlet i = start;`;
                                partitionLoop = `for (let j = start; j !== end; j = j.next) {\n    if (j.data < pivot) {\n        let temp = i.data;\n        i.data = j.data;\n        j.data = temp;\n        i = i.next;\n    }\n}`;
                                fixPivot = `let temp = i.data;\ni.data = end.data;\nend.data = temp;\nreturn i;`;
                                divideConquer = `if (start !== pivot_node) {\n    let temp = start;\n    // ...\n    this._quick_sort(start, temp);\n}\nif (pivot_node !== end) {\n    this._quick_sort(pivot_node.next, end);\n}`;
                                oneWayMovement = `let temp = start;\nwhile (temp.next !== pivot_node) {\n    temp = temp.next;\n}`;
                                break;
                            case 'cpp':
                            default:
                                findTail = `Node* get_tail() {\n    if (head == nullptr) return nullptr;\n    Node* temp = head;\n    while (temp->next != head) {\n        temp = temp->next;\n    }\n    return temp;\n}`;
                                choosePivot = `int pivot = end->data;\nNode* i = start;`;
                                partitionLoop = `for (Node* j = start; j != end; j = j->next) {\n    if (j->data < pivot) {\n        std::swap(i->data, j->data);\n        i = i->next;\n    }\n}`;
                                fixPivot = `std::swap(i->data, end->data);\nreturn i;`;
                                divideConquer = `if (start != pivot_node) {\n    Node* temp = start;\n    // ...\n    _quick_sort(start, temp);\n}\nif (pivot_node != end) {\n    _quick_sort(pivot_node->next, end);\n}`;
                                oneWayMovement = `Node* temp = start;\nwhile (temp->next != pivot_node) {\n    temp = temp->next;\n}`;
                                break;
                        }
                        return `<h3>Quick Sort in a circular list</h3>
<p>"Quick sort" is one of the most powerful algorithms. Its main idea is to choose one "benchmark" (pivot) cargo and scatter the rest so that all lighter cargoes end up to its left, and heavier ones to its right.</p>
<p>Sorting a circular list using this method is quite interesting. Since the train is locked in an endless circle, the algorithm first needs to "mentally" break it by defining clear boundaries: where our temporary "beginning" and "end" are. It is important to note: in this version of the algorithm, we do not decouple the cars themselves (so as not to break the ring), but only move the boxes with numbers from one car to another (value swapping).</p>
<h3>How it works step-by-step:</h3>
<ul>
<li><pre><code>${findTail}</code></pre><strong>Finding boundaries (Defining the Tail):</strong> First of all, the program checks if the train exists. If it has more than one car, the algorithm sends a cursor around the circle to find the very last car (the Tail), which is coupled to the Head. Now we have a clear working area: from the Head to the Tail.</li>
<li><pre><code>${choosePivot}</code></pre><strong>Choosing the "Benchmark" (Pivot):</strong> The algorithm takes the cargo from the very last car of our working area and designates it as the "benchmark".</li>
<li><pre><code>${partitionLoop}</code></pre><strong>Partitioning (Sorting by groups):</strong> A scout cursor is launched, starting from the first car. Its goal is to find all cargoes that are lighter than our benchmark. As soon as the scout finds such a light cargo, it moves it closer to the beginning of the train (swaps places with other cargoes).</li>
<li><pre><code>${fixPivot}</code></pre><strong>Fixing the Pivot:</strong> When the scout checks all the cars, we will know exactly where the group of "light" cargoes ends. The program takes our "benchmark" cargo from the last car and places it exactly on this boundary. From now on, this cargo stands in its perfect, final place!</li>
<li><pre><code>${divideConquer}</code></pre><strong>Divide and conquer (Recursion):</strong> Now our train is logically divided into two unsorted parts: the cars to the left of the pivot and the cars to the right. The algorithm takes the left part and repeats all the steps for it (again finds the end of this zone, chooses a new pivot, divides the cargoes). Then it does the same for the right part.</li>
<li><pre><code>${oneWayMovement}</code></pre><strong>The difficulty of one-way movement:</strong> To sort the left group, the algorithm needs to know where it ends (i.e., to find the car immediately preceding our fixed pivot). Since the train can only move forward, the program has to make an additional run from the beginning of the left group every time to find this penultimate car.</li>
</ul>
<h3>Time complexity:</h3>
<ul>
<li><strong>O(n log n) in the best and average cases:</strong> If the pivot cargo divides the zone into approximately two equal halves each time, the algorithm works extremely efficiently. It organizes the data lightning fast, living up to its "Quick" name.</li>
<li><strong>O(n²) in the worst case:</strong> This is the weak point of the algorithm. If you give it a train where the cargoes are already arranged perfectly (or vice versa, in reverse order), the very last car will always have the largest (or smallest) cargo. Because of this, the partitioning will be terrible: 0 cars on one side, and all the others on the other. In such a scenario, plus considering the need to constantly run forward to find boundaries, the speed of the algorithm drops significantly and becomes as slow as "bubble sort".</li>
</ul>`;
                    }
                }

                if (algo === 'Bubble Sort') {
                    let codeDef, checkEmpty, startPass, compare, shorten, finishSort;
                    switch (progLang) {
                        case 'python':
                            checkEmpty = `if not self.head: return`;
                            startPass = `swapped = True\nwhile swapped:\n    swapped = False\n    current = self.head`;
                            compare = `if current.data > current.next.data:\n    current.data, current.next.data = current.next.data, current.data\n    swapped = True\ncurrent = current.next`;
                            shorten = ``;
                            finishSort = `# loop ends automatically when swapped == False`;
                            break;
                        case 'java':
                            checkEmpty = `if(head == null) return;`;
                            startPass = `boolean swapped;\nNode current;\ndo {\n    swapped = false;\n    current = head;`;
                            compare = `if (current.data > current.next.data) {\n    int t = current.data; current.data = current.next.data; current.next.data = t;\n    swapped = true;\n}\ncurrent = current.next;`;
                            shorten = ``;
                            finishSort = `} while (swapped);`;
                            break;
                        case 'javascript':
                            checkEmpty = `if(!this.head) return;`;
                            startPass = `let swapped;\ndo {\n    swapped = false;\n    let current = this.head;`;
                            compare = `if (current.data > current.next.data) {\n    let t = current.data; current.data = current.next.data; current.next.data = t;\n    swapped = true;\n}\ncurrent = current.next;`;
                            shorten = ``;
                            finishSort = `} while (swapped);`;
                            break;
                        case 'cpp':
                        default:
                            checkEmpty = `if(!head) return;`;
                            startPass = `bool swapped;\nNode* ptr1;\nNode* lptr = nullptr;\ndo {\n    swapped = false;\n    ptr1 = head;`;
                            compare = `if (ptr1->data > ptr1->next->data) {\n    swap(ptr1->data, ptr1->next->data);\n    swapped = true;\n}\nptr1 = ptr1->next;`;
                            shorten = `lptr = ptr1;`;
                            finishSort = `} while (swapped);`;
                            break;
                    }

                    const shortenHtml = shorten ? `<pre><code>${shorten}</code></pre>` : `<em>(Note: This optimization is shown in the C++ snippet but omitted in this basic snippet for simplicity)</em><br>`;

                    return `<h3>Sorting the list (Bubble Sort)</h3>
<p>The "bubble sort" algorithm is one of the simplest ways to arrange elements from smallest to largest. It gets its name because, during its operation, the largest values gradually "float" to the end of the list, like air bubbles in water.</p>
<p>An interesting feature of this algorithm specifically for linked lists is that we do not break the connections or rearrange the nodes (cars) themselves. We do something simpler: we simply exchange the information (cargo) inside these nodes.</p>
<h3>How it works step-by-step:</h3>
<ul>
<li><pre><code>${checkEmpty}</code></pre><strong>Checking for emptiness:</strong> First of all, the algorithm checks if our list is empty. If there is nothing to sort, the operation immediately ends.</li>
<li><pre><code>${startPass}</code></pre><strong>Starting the passes:</strong> The program begins moving from the start of the list. To control the process, a special flag (indicator) is created, which is initially turned off. It will record whether we swapped anything during the current pass.</li>
<li><pre><code>${compare}</code></pre><strong>Comparing neighbors:</strong> The cursor is placed on the first node and compares its value with the one in the next node. If the current value is greater than the next one (the order is violated), the program swaps their data and turns on our flag. Then the cursor takes a step forward and compares the next pair.</li>
<li>${shortenHtml}<strong>Shortening the path (optimization):</strong> After each full pass from beginning to end, the largest number is guaranteed to end up in the very last position. To avoid doing unnecessary work, the algorithm remembers this final position. During the next pass, it will no longer check the end of the list, stopping one step earlier.</li>
<li><pre><code>${finishSort}</code></pre><strong>Finishing the sorting:</strong> The passes from the beginning to the unsorted part are repeated over and over. The algorithm completely stops its operation only when the flag remains turned off during a regular pass. This means that no swaps occurred, and therefore — the list is perfectly sorted!</li>
</ul>
<h3>Time complexity:</h3>
<ul>
<li><strong>O(n²) in the worst and average cases:</strong> If the list is scrambled or sorted in reverse order, the algorithm will have to make many passes. For a list of many elements, the number of operations grows very rapidly (quadratically). Therefore, this method is considered slow for large volumes of data.</li>
<li><strong>O(n) in the best case:</strong> Thanks to our flag, if we pass an already fully sorted list to the algorithm, it will make only one single pass, make sure that nothing needs to be changed, and instantly finish its work.</li>
</ul>`;
                } else if (algo === 'Insertion Sort') {
                    let checkEmpty, newPlatform, detachCar, findPlace, stepFwd, finishUp;
                    switch (progLang) {
                        case 'python':
                            checkEmpty = `if not self.head or not self.head.next: return`;
                            newPlatform = `sorted_head = None\ncurrent = self.head`;
                            detachCar = `nxt = current.next`;
                            findPlace = `if not sorted_head or sorted_head.data >= current.data:\n    current.next = sorted_head\n    sorted_head = current\nelse:\n    temp = sorted_head\n    while temp.next and temp.next.data < current.data:\n        temp = temp.next\n    current.next = temp.next\n    temp.next = current`;
                            stepFwd = `current = nxt`;
                            finishUp = `self.head = sorted_head`;
                            break;
                        case 'java':
                            checkEmpty = `if (head == null || head.next == null) return;`;
                            newPlatform = `Node sorted = null;\nNode current = head;`;
                            detachCar = `Node next = current.next;`;
                            findPlace = `if (sorted == null || sorted.data >= current.data) {\n    current.next = sorted;\n    sorted = current;\n} else {\n    Node temp = sorted;\n    while (temp.next != null && temp.next.data < current.data) temp = temp.next;\n    current.next = temp.next;\n    temp.next = current;\n}`;
                            stepFwd = `current = next;`;
                            finishUp = `head = sorted;`;
                            break;
                        case 'javascript':
                            checkEmpty = `if (!this.head || !this.head.next) return;`;
                            newPlatform = `let sorted = null;\nlet current = this.head;`;
                            detachCar = `let next = current.next;`;
                            findPlace = `if (!sorted || sorted.data >= current.data) {\n    current.next = sorted;\n    sorted = current;\n} else {\n    let temp = sorted;\n    while (temp.next && temp.next.data < current.data) temp = temp.next;\n    current.next = temp.next;\n    temp.next = current;\n}`;
                            stepFwd = `current = next;`;
                            finishUp = `this.head = sorted;`;
                            break;
                        case 'cpp':
                        default:
                            checkEmpty = `if (!head || !head->next) return;`;
                            newPlatform = `Node* sorted = nullptr;\nNode* current = head;`;
                            detachCar = `Node* next = current->next;`;
                            findPlace = `if (sorted == nullptr || sorted->data >= current->data) {\n    current->next = sorted;\n    sorted = current;\n} else {\n    Node* temp = sorted;\n    while (temp->next != nullptr && temp->next->data < current->data) temp = temp->next;\n    current->next = temp->next;\n    temp->next = current;\n}`;
                            stepFwd = `current = next;`;
                            finishUp = `head = sorted;`;
                            break;
                    }

                    return `<h3>Sorting the list (Insertion Sort)</h3>
<p>The "insertion sort" algorithm works exactly the same way most people sort cards in their hands during a game. You take one card at a time from the unsorted deck and insert it into the correct place among the cards you have already ordered.</p>
<p>In the case of a linked list, we literally "disassemble" our old train step by step and build a new one out of its cars — completely sorted right away. Note: unlike previous algorithms, where we simply exchanged the cargo between the cars, here we actually re-couple the cars themselves (we change the pointers).</p>
<h3>How it works step-by-step:</h3>
<ul>
<li><pre><code>${checkEmpty}</code></pre><strong>Checking for emptiness:</strong> As always, we first check if there is anything to sort. If the list is empty or has only one element, the algorithm immediately ends its work — such a list is considered already sorted!</li>
<li><pre><code>${newPlatform}</code></pre><strong>Creating a new platform:</strong> The algorithm creates an empty pointer for a new, "sorted" list. Initially, there is nothing in it. We also place our main cursor on the first car of the original list.</li>
<li><pre><code>${detachCar}</code></pre><strong>Detaching the car:</strong> We focus on the current car, but before detaching it, we must "remember" which car comes after it. This is extremely important so as not to lose the rest of the train when we break the connections.</li>
<li><pre><code>${findPlace}</code></pre><strong>Finding the right place:</strong> Now we look at our new, "sorted" list and look for exactly where to insert this detached car:<br>
- If the new list is still empty, or if our car has a smaller value than the very first car of the new list — we simply put it at the very beginning. It becomes the Head of the sorted list.<br>
- If not, we launch a temporary search cursor that goes through the new list from the beginning and looks for a place where the next car will be larger than ours. Having found such a "gap", we carefully make space between the cars and insert ours exactly there.</li>
<li><pre><code>${stepFwd}</code></pre><strong>Stepping forward:</strong> After the car is successfully placed in its spot, our main cursor returns to that next car from the old train, which we remembered in step 3.</li>
<li><pre><code>${finishUp}</code></pre><strong>Finishing up:</strong> This process (detach -&gt; find place -&gt; insert) is repeated until the cars in the old list run out. At the end, we simply hang the "Head" sign at the beginning of our new, perfectly sorted train.</li>
</ul>
<h3>Time complexity:</h3>
<ul>
<li><strong>O(n²) (Quadratic time) in the worst and average cases:</strong> If the list is sorted in reverse order, for each insertion the algorithm will have to go through the entire already sorted chain from beginning to end to find the right place. For a large number of elements, this takes a lot of time.</li>
<li><strong>O(n) in the best case:</strong> This algorithm has one superpower — it works lightning fast if the list is already almost sorted or has a very small number of elements.</li>
</ul>`;
                } else if (algo === 'Selection Sort') {
                    let codeDef, divZones, assumeMin, scout, swapData, stepFwd;
                    switch (progLang) {
                        case 'python':
                            divZones = `temp = self.head\nwhile temp:`;
                            assumeMin = `min_node = temp`;
                            scout = `r = temp.next\nwhile r:\n    if min_node.data > r.data: min_node = r\n    r = r.next`;
                            swapData = `temp.data, min_node.data = min_node.data, temp.data`;
                            stepFwd = `temp = temp.next`;
                            break;
                        case 'java':
                            divZones = `Node temp = head;\nwhile (temp != null) {`;
                            assumeMin = `Node min = temp;`;
                            scout = `Node r = temp.next;\nwhile (r != null) {\n    if (min.data > r.data) min = r;\n    r = r.next;\n}`;
                            swapData = `int x = temp.data; temp.data = min.data; min.data = x;`;
                            stepFwd = `temp = temp.next;\n}`;
                            break;
                        case 'javascript':
                            divZones = `let temp = this.head;\nwhile (temp) {`;
                            assumeMin = `let min = temp;`;
                            scout = `let r = temp.next;\nwhile (r) {\n    if (min.data > r.data) min = r;\n    r = r.next;\n}`;
                            swapData = `let x = temp.data; temp.data = min.data; min.data = x;`;
                            stepFwd = `temp = temp.next;\n}`;
                            break;
                        case 'cpp':
                        default:
                            divZones = `Node* temp = head;\nwhile (temp) {`;
                            assumeMin = `Node* min = temp;`;
                            scout = `Node* r = temp->next;\nwhile (r) {\n    if (min->data > r->data) min = r;\n    r = r->next;\n}`;
                            swapData = `swap(temp->data, min->data);`;
                            stepFwd = `temp = temp->next;\n}`;
                            break;
                    }

                    return `<h3>Sorting the list (Selection Sort)</h3>
<p>The "selection sort" algorithm works on a very real-world principle. Imagine you have a row of cards with numbers laid out in front of you. You scan for the smallest number with your eyes, pick it up, and place it in the very first spot. Then you look for the smallest among the remaining ones and place it in the second spot. And so on, until all the cards are in order.</p>
<p>As with the previous sorting algorithm, we do not break the connections between the nodes (we do not rearrange the cars themselves). We simply exchange the information (useful cargo) inside them.</p>
<h3>How it works step-by-step:</h3>
<ul>
<li><pre><code>${divZones}</code></pre><strong>Dividing into zones:</strong> The algorithm conditionally divides our list into two parts: "already sorted" and "not yet sorted". Initially, the sorted part is empty. The program sets the main pointer (cursor) to the very beginning of the list.</li>
<li><pre><code>${assumeMin}</code></pre><strong>Assuming the minimum:</strong> While at the current node, the algorithm temporarily assumes that it contains the smallest value. It remembers this node as the "minimum".</li>
<li><pre><code>${scout}</code></pre><strong>Finding the true minimum (scouting):</strong> Next, the program sends a second "scout" pointer forward. This scout traverses from the next node to the very end of the list. Its task is to compare each number with our "temporary minimum". If the scout finds a number that is even smaller, the program updates the information and remembers the new location of the smallest element.</li>
<li><pre><code>${swapData}</code></pre><strong>Swapping data:</strong> When the scout reaches the end of the list, we know exactly where the smallest value in this unsorted part lies. Now the program simply swaps the data between the current node (where our main cursor is) and the found minimum node.</li>
<li><pre><code>${stepFwd}</code></pre><strong>Stepping forward:</strong> The smallest element is successfully placed in its correct position! Now the main cursor takes one step forward (the sorted zone increases), and the entire process of finding the minimum is repeated for the rest of the list. The algorithm stops when the cursor reaches the end.</li>
</ul>
<h3>Time complexity:</h3>
<ul>
<li><strong>O(n²) (Quadratic time) in all cases:</strong> Unlike the "bubble" sort, selection sort cannot recognize if the list is sorted in advance. Even if you pass it a perfectly ordered train, the scout will still diligently run to the end of the list at each step to make absolutely sure there is no smaller number. Therefore, for a list of n elements, it always takes approximately n * n steps. This algorithm is also inefficient for large lists.</li>
</ul>`;
                } else if (algo === 'Quick Sort') {
                    let choosePivot, partitioning, fixPivot, recursion;
                    switch (progLang) {
                        case 'python':
                            choosePivot = `pivot = head\ncurr = head.next\nprev = head`;
                            partitioning = `while curr != tail.next:\n    if curr.data < pivot.data:\n        prev.next.data, curr.data = curr.data, prev.next.data\n        prev = prev.next\n    curr = curr.next`;
                            fixPivot = `pivot.data, prev.data = prev.data, pivot.data\nreturn prev`;
                            recursion = `if not head or head == tail: return\npivot = partition(head, tail)\nif pivot != head:\n    temp = head\n    while temp.next != pivot: temp = temp.next\n    quick_sort_rec(head, temp)\nquick_sort_rec(pivot.next, tail)`;
                            break;
                        case 'java':
                            choosePivot = `Node pivot = head;\nNode curr = head.next;\nNode prev = head;`;
                            partitioning = `while (curr != tail.next) {\n    if (curr.data < pivot.data) {\n        int temp = prev.next.data; prev.next.data = curr.data; curr.data = temp;\n        prev = prev.next;\n    }\n    curr = curr.next;\n}`;
                            fixPivot = `int temp = pivot.data; pivot.data = prev.data; prev.data = temp;\nreturn prev;`;
                            recursion = `if (head == null || head == tail) return;\nNode pivot = partition(head, tail);\nif (pivot != head) {\n    Node temp = head;\n    while (temp.next != pivot) temp = temp.next;\n    quickSortRec(head, temp);\n}\nquickSortRec(pivot.next, tail);`;
                            break;
                        case 'javascript':
                            choosePivot = `let pivot = head;\nlet curr = head.next;\nlet prev = head;`;
                            partitioning = `while (curr !== tail.next) {\n    if (curr.data < pivot.data) {\n        let temp = prev.next.data; prev.next.data = curr.data; curr.data = temp;\n        prev = prev.next;\n    }\n    curr = curr.next;\n}`;
                            fixPivot = `let temp = pivot.data; pivot.data = prev.data; prev.data = temp;\nreturn prev;`;
                            recursion = `if (!head || head === tail) return;\nlet pivot = this.partition(head, tail);\nif (pivot !== head) {\n    let temp = head;\n    while (temp.next !== pivot) temp = temp.next;\n    this.quickSortRec(head, temp);\n}\nthis.quickSortRec(pivot.next, tail);`;
                            break;
                        case 'cpp':
                        default:
                            choosePivot = `Node* pivot = head;\nNode* curr = head->next;\nNode* prev = head;`;
                            partitioning = `while (curr != tail->next) {\n    if (curr->data < pivot->data) {\n        swap(prev->next->data, curr->data);\n        prev = prev->next;\n    }\n    curr = curr->next;\n}`;
                            fixPivot = `swap(pivot->data, prev->data);\nreturn prev;`;
                            recursion = `if (!head || head == tail) return;\nNode* pivot = partition(head, tail);\nif (pivot != head) {\n    Node* temp = head;\n    while (temp->next != pivot) temp = temp->next;\n    quickSortRec(head, temp);\n}\nquickSortRec(pivot->next, tail);`;
                            break;
                    }

                    return `<h3>Sorting the list (Quick Sort)</h3>
<p>The "quick sort" algorithm is considered one of the most powerful and efficient methods for sorting data. Imagine you need to line up a group of people by height. Instead of comparing everyone with everyone else, you pick one person at random and say: "Everyone who is shorter than them — stand to the left, and everyone who is taller — to the right." Then you do the same separately for the left and right groups. This is exactly how this algorithm works!</p>
<p>In the provided sorting variant for a singly linked list, we use the "value swapping" approach. This means that we do not break the connections between the cars of our train, but simply move the cargo (data) from one car to another to group them correctly.</p>
<h3>How it works step-by-step:</h3>
<ul>
<li><pre><code>${choosePivot}</code></pre><strong>Choosing the "Pivot" element:</strong> First, the algorithm chooses one car, the cargo of which becomes our benchmark (most often it is simply the very first element in the list or its current part). We will use this number for comparison.</li>
<li><pre><code>${partitioning}</code></pre><strong>Partitioning:</strong> Next, a special scout pointer is launched, which checks all the other cars. Its goal is to find all numbers that are smaller than our pivot benchmark. As soon as it finds such a small number, it swaps its data with the cargo located closer to the beginning of the train. Thus, all the "light" cargoes gradually bunch up into one group on the left.</li>
<li><pre><code>${fixPivot}</code></pre><strong>Fixing the pivot element:</strong> When the scout checks all the cars, we will know exactly where the group of "smaller" numbers ends and the group of "larger" numbers begins. It is exactly to this boundary that the algorithm moves our initial pivot number. From now on, this number stands in its perfect, final place! It will never move again.</li>
<li><pre><code>${recursion}</code></pre><strong>Repetition (Recursion):</strong> Now our train is visually divided into two unsorted parts: the cars to the left of the fixed number and the cars to the right. The program takes the left part and repeats all the steps for it (chooses a new pivot number, divides into smaller/larger). Then it does the same for the right part. This process is repeated until there are "groups" of one car left, which are already considered sorted.</li>
</ul>
<h3>Special feature for singly linked lists:</h3>
<p>Since we can only move forward in a singly linked list, the algorithm has to make an additional pass from the beginning of the list each time to find the car that stands immediately before our fixed pivot element (to understand where the left part ends). Therefore, this sorting is slightly more difficult to implement here than in standard arrays or doubly linked lists.</p>
<h3>Time complexity:</h3>
<ul>
<li><strong>O(n log n) in the best and average cases:</strong> If the pivot element divides the list into approximately two equal halves each time, the algorithm works extremely efficiently. It lives up to its name and sorts data very quickly, even if there are millions of them.</li>
<li><strong>O(n²) in the worst case:</strong> This is the "Achilles' heel" of quick sort. If you give it an already sorted list (or sorted in reverse order), the very first element will always be the smallest or the largest. The list will be divided very unevenly: one car on one side, and all the others on the other. In this case, the algorithm's speed drops significantly and becomes as slow as "bubble sort".</li>
</ul>`;
                }
                return `Sorts the list using ${algo || 'the chosen algorithm'}.`;
            },
            'add_vertex': (progLang) => {
                if (currentStructure === 'undirected-graph') {
                    let appendEmpty, incCounter, notifyOpen;
                    switch (progLang) {
                        case 'python':
                            appendEmpty = `self.adj.append([])`;
                            incCounter = `self.numVertices += 1`;
                            notifyOpen = `print(f"Added vertex {self.numVertices - 1}")`;
                            break;
                        case 'java':
                            appendEmpty = `adj.add(new ArrayList<Integer>());`;
                            incCounter = `numVertices++;`;
                            notifyOpen = `System.out.println("Added vertex " + (numVertices - 1));`;
                            break;
                        case 'javascript':
                            appendEmpty = `this.adj.push([]);`;
                            incCounter = `this.numVertices++;`;
                            notifyOpen = `console.log(\`Added vertex \${this.numVertices - 1}\\n\`);`;
                            break;
                        case 'cpp':
                        default:
                            appendEmpty = `adj.push_back(std::vector<int>());`;
                            incCounter = `numVertices++;`;
                            notifyOpen = `std::cout << "Added vertex " << numVertices - 1 << std::endl;`;
                            break;
                    }
                    return `<h3>Adding a vertex to a graph (add_vertex)</h3>
<p><strong>Real-life Analogy: Building a New Railway Station</strong></p>
<p>Imagine we are expanding the country's transport network. We already have a certain number of cities connected by tracks. This algorithm acts as an order to build a completely new station somewhere out in a field.</p>
<p>Here are the steps involved in this "construction":</p>
<ul>
<li><pre><code>${appendEmpty}</code></pre><strong>Clearing a vacant lot (Adding a list):</strong> The algorithm creates a new, completely empty entry in the main route ledger. This means: "The station already exists, but no tracks have been laid to it yet." The new vertex is added in isolation, without any connections to others.</li>
<li><pre><code>${incCounter}</code></pre><strong>Updating statistics (Incrementing the counter):</strong> We take the general register of all stations in the network and increase their total count by one. Now the system officially knows that the number of objects has grown.</li>
<li><pre><code>${notifyOpen}</code></pre><strong>Official opening (Outputting a message):</strong> A notification is sent to the dispatchers: "Attention, a new station with such-and-such number has been successfully added" (in programming, numbering usually starts at zero, so the new station's number is one less than the total count).</li>
</ul>
<p>After executing this algorithm, a new point appears in our network, patiently waiting for another algorithm (adding an edge) to lay routes to it.</p>
<h3>Efficiency Evaluation (Big O)</h3>
<p><strong>Time complexity:</strong> O(1) (amortized)<br>
Adding a new empty entry to the end of a dynamic array (an adjacency list) usually happens instantly. We do not need to check or move existing stations; we simply append the new one to the end of the list.</p>
<p><strong>Space complexity:</strong> O(1)<br>
The algorithm allocates a minimal amount of memory solely for one new, empty list of connections. The scale of the graph itself does not affect this cost in any way.</p>`;
                } else if (currentStructure.includes('graph')) {
                    let checkExist, addSuccess;
                    switch (progLang) {
                        case 'python':
                            checkExist = `if vertex not in self.adj_list:`;
                            addSuccess = `self.adj_list[vertex] = []`;
                            break;
                        case 'java':
                            checkExist = `if (!adj_list.containsKey(vertex)) {`;
                            addSuccess = `adj_list.put(vertex, new ArrayList<Integer>());`;
                            break;
                        case 'javascript':
                            checkExist = `if (!this.adj_list.has(vertex)) {`;
                            addSuccess = `this.adj_list.set(vertex, []);`;
                            break;
                        case 'cpp':
                        default:
                            checkExist = `if (adj_list.find(vertex) == adj_list.end()) {`;
                            addSuccess = `adj_list[vertex] = std::vector<int>();`;
                            break;
                    }
                    return `<h3>Adding a vertex to a graph (add_vertex)</h3>
<p>We are moving on to an extremely powerful data structure — Graphs. If a linked list resembled a train of sequential cars, a graph is best imagined as a map of cities (which in programming are called "vertices" or nodes) connected by roads (which are called "edges").<br>
The <code>add_vertex</code> function performs the very first and simplest action — it simply registers a new city on our empty or already existing map.</p>
<h3>How it works step-by-step:</h3>
<ul>
<li><pre><code>${checkExist}</code></pre><strong>Checking the directory (Finding duplicates):</strong> Before building a new city, the program looks into its main directory (the so-called "adjacency list") to check if there is already a city with exactly the same name or identification number.</li>
<li><pre><code>${addSuccess}</code></pre><strong>Registering a new city:</strong> If the check shows that such a city does not exist yet, the program officially adds it to the directory. At this stage, the city is created completely isolated — no roads lead to it yet, and it is impossible to travel anywhere from it (an empty list of connections is created for it). We will build roads (edges) later using other functions.</li>
<li><strong>Error protection:</strong> If a city with this number is already present on the map, the algorithm does not overwrite anything and simply informs the user that such a point already exists. This is a very important protective mechanism. If we allowed the creation of two cities with identical numbers, our navigation system would simply break down, not understanding exactly where to plot routes.</li>
</ul>
<h3>Time complexity:</h3>
<ul>
<li><strong>O(1) or O(log V) (Very fast):</strong> The speed of adding a vertex depends on exactly how our "directory" is technically structured under the hood of the program:
<ul>
<li>If the directory works on the principle of instant search (hash table), the check and creation of a new record occur in perfect constant time — O(1).</li>
<li>If the directory is structured as an ordered search tree, the program will need a little time to find the right place by alphabet or number. In this case, the speed will be O(log V), where V is the number of already existing vertices (cities).</li>
</ul>
</li>
</ul>
<p>In both cases, this is an extremely efficient operation that is performed almost instantly.</p>`;
                }
                return `Adds a new vertex to the graph. Time Complexity: O(1).`;
            },
            'add_edge': (progLang) => {
                if (currentStructure === 'undirected-graph') {
                    let safetyCheck, firstConn, secondConn;
                    switch (progLang) {
                        case 'python':
                            safetyCheck = `if u >= self.numVertices or v >= self.numVertices or u < 0 or v < 0:\n    print("Error: One or both vertices do not exist!")\n    return`;
                            firstConn = `self.adj[u].append(v)`;
                            secondConn = `self.adj[v].append(u)`;
                            break;
                        case 'java':
                            safetyCheck = `if (u >= numVertices || v >= numVertices || u < 0 || v < 0) {\n    System.out.println("Error: One or both vertices do not exist!");\n    return;\n}`;
                            firstConn = `adj.get(u).add(v);`;
                            secondConn = `adj.get(v).add(u);`;
                            break;
                        case 'javascript':
                            safetyCheck = `if (u >= this.numVertices || v >= this.numVertices || u < 0 || v < 0) {\n    console.log("Error: One or both vertices do not exist!\\n");\n    return;\n}`;
                            firstConn = `this.adj[u].push(v);`;
                            secondConn = `this.adj[v].push(u);`;
                            break;
                        case 'cpp':
                        default:
                            safetyCheck = `if (u >= numVertices || v >= numVertices || u < 0 || v < 0) {\n    std::cout << "Error: One or both vertices do not exist!" << std::endl;\n    return;\n}`;
                            firstConn = `adj[u].push_back(v);`;
                            secondConn = `adj[v].push_back(u);`;
                            break;
                    }
                    return `<h3>Adding a connection / edge (add_edge)</h3>
<p><strong>Real-life Analogy: Laying a Double-Track Railway Between Cities</strong></p>
<p>If in the previous example we built isolated stations, now we are allocating resources to connect two of them with a fully functional track. Since the graph is undirected, this is like building a standard double-track railway where trains can freely travel in both directions.</p>
<p>Here is how the logic of this process works step-by-step:</p>
<ul>
<li><pre><code>${safetyCheck}</code></pre><strong>Reality check (Safety check):</strong> Before dispatching a construction crew, the chief engineer always consults the map. They check whether both specified stations actually exist in reality (their numbers cannot be negative or greater than the total number of existing stations). If someone gives an order to connect an existing station with some imaginary stop "No. 999", the system immediately blocks this action and reports an error. You cannot build tracks to nowhere.</li>
<li><pre><code>${firstConn}</code></pre><strong>Updating the schedule of the first station (Connection u &rarr; v):</strong> If both stations exist, we inform the stationmaster of the first station: "You now have a direct route to the second station." They add this direction to their local list of available trips.</li>
<li><pre><code>${secondConn}</code></pre><strong>Mirror update (Connection v &rarr; u):</strong> Since our railway operates in two directions, we must absolutely call the stationmaster of the second station and give a similar instruction: "Add a return trip to the first station to your schedule."</li>
</ul>
<p>Without this last step, we would end up with a directed graph (a one-way street), but for two-way communication, it is crucial to record the information in the logs of both nodes.</p>
<h3>Efficiency Evaluation (Big O)</h3>
<p><strong>Time complexity:</strong> O(1) (amortized)<br>
Checking the existence of the stations is an instantaneous mathematical operation. The actual "laying of the route" consists of quickly adding one entry to the end of the lists for two specific stations. The execution time does not depend on how massive the entire transport network is.</p>
<p><strong>Space complexity:</strong> O(1)<br>
To record the new connection, the algorithm uses exactly two new memory elements (one for each direction). The scale of the entire graph does not affect this cost.</p>`;
                } else if (currentStructure.includes('graph')) {
                    let prepVertex, linkEdge;
                    switch (progLang) {
                        case 'python':
                            prepVertex = `self.add_vertex(source)\nself.add_vertex(destination)`;
                            linkEdge = `self.adj_list[source].append(destination)`;
                            break;
                        case 'java':
                            prepVertex = `add_vertex(source);\nadd_vertex(destination);`;
                            linkEdge = `adj_list.get(source).add(destination);`;
                            break;
                        case 'javascript':
                            prepVertex = `this.add_vertex(source);\nthis.add_vertex(destination);`;
                            linkEdge = `this.adj_list.get(source).push(destination);`;
                            break;
                        case 'cpp':
                        default:
                            prepVertex = `add_vertex(source);\nadd_vertex(destination);`;
                            linkEdge = `adj_list[source].push_back(destination);`;
                            break;
                    }
                    return `<h3>Adding a connection / edge (add_edge)</h3>
<p>If vertices are cities on our map, then edges are the roads that connect them. Without roads, our graph would consist simply of a set of isolated points between which it is impossible to travel.</p>
<p>The function we are looking at creates a directed edge. In real life, this is the exact equivalent of a one-way street. That is, we lay a route from City A to City B, but this does not mean that you can return back along this exact same road!</p>
<h3>How it works step-by-step:</h3>
<ul>
<li><pre><code>${prepVertex}</code></pre><strong>Checking the existence of cities:</strong> Before building a road, it is logical to make sure that both cities actually exist. The algorithm takes the starting point and the finishing point and checks our main directory. If any of these cities are not yet on the map, the program automatically creates them (using the previous <code>add_vertex</code> function). This protects the system from errors: we will never build a road to "nowhere."</li>
<li><pre><code>${linkEdge}</code></pre><strong>Setting the pointer (Laying the road):</strong> Once we have ensured that both cities are on the map, the algorithm looks into the directory of the starting city. It adds the destination city to the list of available exits from this starting city.</li>
<li><strong>One-way nature:</strong> Note: the program records the route only in the directory of the starting city. No new records appear in the directory of the destination city. This is exactly why the road turns out to be one-way. (If we wanted to make a standard two-way highway, the program would have to take one more step and record the return route).</li>
</ul>
<h3>Time complexity:</h3>
<ul>
<li><strong>O(1) (Very fast):</strong> The actual process of adding a new record about the road to the city's list of exits happens almost instantly. The overall execution time depends only on how quickly the program finds these cities in the directory (as we found out earlier, this takes O(1) or O(log V) time). In any case, the speed of laying a new road does not depend on how many millions of other roads already exist on our map. This is an extremely efficient operation!</li>
</ul>`;
                }
                return `Adds a directed or undirected edge between two vertices. Time Complexity: O(1) for adjacency list.`;
            },
            'bfs': (progLang) => {
                if (currentStructure === 'undirected-graph') {
                    let setupQueue, markVisited, addToQueue;
                    switch (progLang) {
                        case 'python':
                            setupQueue = `visited = [False] * self.numVertices\nq = []`;
                            markVisited = `visited[neighbor] = True`;
                            addToQueue = `q.append(neighbor)`;
                            break;
                        case 'java':
                            setupQueue = `boolean[] visited = new boolean[numVertices];\nQueue<Integer> q = new LinkedList<>();`;
                            markVisited = `visited[neighbor] = true;`;
                            addToQueue = `q.add(neighbor);`;
                            break;
                        case 'javascript':
                            setupQueue = `const visited = new Array(this.numVertices).fill(false);\nconst q = [];`;
                            markVisited = `visited[neighbor] = true;`;
                            addToQueue = `q.push(neighbor);`;
                            break;
                        case 'cpp':
                        default:
                            setupQueue = `std::vector<bool> visited(numVertices, false);\nstd::queue<int> q;`;
                            markVisited = `visited[neighbor] = true;`;
                            addToQueue = `q.push(neighbor);`;
                            break;
                    }
                    return `<h3>Breadth-First Search (BFS)</h3>
<p><strong>Real-life Analogy: Large-scale Rescue Operation</strong></p>
<p>Imagine a dog gets lost in the city, and you are in charge of the search operation headquarters. Your task is to comb the area so that no alley is left unattended, gradually expanding the search zone around the point where the pet was last seen.</p>
<p>Here is how your strategy works (it fully reflects the logic of BFS):</p>
<ul>
<li><pre><code>${setupQueue}</code></pre><strong>Setting up headquarters (Start node and queue):</strong> You pitch a tent at the intersection where the search begins (<code>startNode</code>). To avoid chaos, you grab a megaphone and a notebook (in the algorithm, this is a queue). In this notebook, you will write down all the intersections that need to be checked, strictly in the order of their turn.</li>
<li><pre><code>${markVisited}</code></pre><strong>Checking the nearest neighbors (First circle):</strong> First, you send rescuers to all the immediately adjacent intersections (one block away). When the rescuers arrive at the location, they put a "checked" mark.</li>
<li><pre><code>${addToQueue}</code></pre><strong>Planning the next wave (Adding to the queue):</strong> From each checked neighboring intersection, the rescuers see new streets leading even further. They radio their coordinates back to you. You do not tell them to run there immediately! You simply write these new coordinates at the end of your notebook.</li>
<li><strong>Ripple effect on water:</strong> You continue to call out teams strictly according to the list from the notebook. Thanks to this rule, the headquarters is guaranteed to first check all points at a distance of 1 block, then &mdash; all points at a distance of 2 blocks, then &mdash; 3 blocks, and so on. The search spreads in even concentric circles, like ripples from a stone thrown into water.</li>
</ul>
<p>The main strength of BFS is that it is guaranteed to find the shortest path (with the fewest number of transitions) from the starting point to any other, because it will never move on to distant blocks until it has explored the closer ones.</p>
<h3>Efficiency Evaluation (Big O)</h3>
<p><strong>Time complexity:</strong> O(V + E)<br>
Just as with depth-first search, V is the number of intersections, and E is the number of streets between them. To thoroughly comb the city, we will have to visit every intersection and walk down every street exactly once. The execution time grows linearly depending on the size of the graph.</p>
<p><strong>Space complexity:</strong> O(V)<br>
Memory is spent on the array of marks (to know where we have already been) and on the queue (our "notebook"). In the worst-case scenario, when the city has a star structure (a huge number of streets radiating simultaneously from the center), our queue at a certain point might store information about almost all the nodes of the graph simultaneously.</p>`;
                } else if (currentStructure.includes('graph')) {
                    let startTrav, loopQueue, checkNeighbors;
                    switch (progLang) {
                        case 'python':
                            startTrav = `visited.add(start_vertex)\nqueue = [start_vertex]`;
                            loopQueue = `while queue:\n    current = queue.pop(0)`;
                            checkNeighbors = `for neighbor in self.adj_list[current]:\n    if neighbor not in visited:`;
                            break;
                        case 'java':
                            startTrav = `visited.add(start_vertex);\nq.add(start_vertex);`;
                            loopQueue = `while (!q.isEmpty()) {\n    int current = q.poll();`;
                            checkNeighbors = `for (int neighbor : adj_list.get(current)) {\n    if (!visited.contains(neighbor)) {`;
                            break;
                        case 'javascript':
                            startTrav = `visited.add(start_vertex);\nqueue.push(start_vertex);`;
                            loopQueue = `while (queue.length > 0) {\n    const current = queue.shift();`;
                            checkNeighbors = `for (const neighbor of this.adj_list.get(current)) {\n    if (!visited.has(neighbor)) {`;
                            break;
                        case 'cpp':
                        default:
                            startTrav = `visited.insert(start_vertex);\nq.push(start_vertex);`;
                            loopQueue = `while (!q.empty()) {\n    int current = q.front();\n    q.pop();`;
                            checkNeighbors = `for (int neighbor : adj_list[current]) {\n    if (visited.find(neighbor) == visited.end()) {`;
                            break;
                    }
                    return `<h3>Breadth-First Search (BFS)</h3>
<p>Imagine you are standing in your hometown and want to explore the entire country. What is the most logical way to do it? The best approach is to first visit all cities directly connected to you (your immediate neighbors). Then, visit all the "neighbors of your neighbors" (cities at a distance of two steps), then towns even further away, and so on.</p>
<p>Your route expands uniformly in all directions, like ripples on water from a stone thrown into a pond. This "wave-like" principle is exactly how the extremely popular "Breadth-First Search" (BFS) algorithm works.</p>
<p>To ensure the algorithm doesn't get lost or go in circles (since roads can form loops), it needs two tools:</p>
<ul>
<li><strong>Visited Log:</strong> A list of cities where we have already been or have already planned to travel.</li>
<li><strong>Queue:</strong> A list of cities waiting to be explored. It works like a regular store queue — the first one in is the first one served.</li>
</ul>
<h3>How it works step-by-step:</h3>
<ul>
<li><strong>Starting check:</strong> First, the navigator checks if the city we want to start from actually exists on the map. If not, the search is canceled.</li>
<li><pre><code>${startTrav}</code></pre><strong>The first step:</strong> We add our starting city to the Visited Log (so we never return there) and place it first in the Queue.</li>
<li><pre><code>${loopQueue}</code></pre><strong>Processing a city:</strong> We take the very first city from the Queue and "visit" it (e.g., display its name on the screen).</li>
<li><pre><code>${checkNeighbors}</code></pre><strong>Scanning neighbors (Planning):</strong> While in this city, we look at all the roads leading out of it. We check each neighbor: if this neighbor is not yet in our Visited Log, we immediately record it there and place it at the very end of the Queue.</li>
<li><strong>Wave movement:</strong> The city is now fully explored! The program again takes the first city from the Queue (which will be one of the neighbors) and repeats the process. Since we always add new cities to the end of the queue, the algorithm is guaranteed to visit all "near" neighbors before moving on to the "far" ones.</li>
<li><strong>Completion:</strong> This process continues until the Queue is completely empty. This means we have visited all the cities on the map that could be reached via the roads.</li>
</ul>
<h3>Time complexity:</h3>
<ul>
<li><strong>O(V + E) (Linear time):</strong> The algorithm's speed depends on the number of Vertices (V, cities) and the number of Edges (E, roads) in our graph. To fully explore the map, the algorithm must "visit" each city exactly once and check each road exactly once. Therefore, the execution time grows proportionally to the size of the map. This is a very efficient algorithm, often used in GPS navigators to find the shortest path!</li>
</ul>
<p>Would you like to explore how Depth-First Search (DFS) compares to BFS, as it takes the opposite approach by diving deep into a single branch before exploring others?</p>`;
                }
                return `Breadth-First Search. Explores the graph layer by layer using a Queue. Time Complexity: O(V + E).`;
            },
            'dfs': (progLang) => {
                if (currentStructure === 'undirected-graph') {
                    let safetyCheck, initVisited, callHelper, fieldWork;
                    switch (progLang) {
                        case 'python':
                            safetyCheck = `if startNode >= self.numVertices or startNode < 0:\n    print("Error: Starting node does not exist!")\n    return`;
                            initVisited = `visited = [False] * self.numVertices`;
                            callHelper = `self.dfs_helper(startNode, visited)`;
                            fieldWork = `visited[currentNode] = True\nfor neighbor in self.adj[currentNode]:\n    if not visited[neighbor]:\n        self.dfs_helper(neighbor, visited)`;
                            break;
                        case 'java':
                            safetyCheck = `if (startNode >= numVertices || startNode < 0) {\n    System.out.println("Error: Starting node does not exist!");\n    return;\n}`;
                            initVisited = `boolean[] visited = new boolean[numVertices];`;
                            callHelper = `dfs_helper(startNode, visited);`;
                            fieldWork = `visited[currentNode] = true;\nfor (int neighbor : adj.get(currentNode)) {\n    if (!visited[neighbor]) {\n        dfs_helper(neighbor, visited);\n    }\n}`;
                            break;
                        case 'javascript':
                            safetyCheck = `if (startNode >= this.numVertices || startNode < 0) {\n    console.log("Error: Starting node does not exist!\\n");\n    return;\n}`;
                            initVisited = `const visited = new Array(this.numVertices).fill(false);`;
                            callHelper = `this.dfs_helper(startNode, visited, result);`;
                            fieldWork = `visited[currentNode] = true;\nfor (const neighbor of this.adj[currentNode]) {\n    if (!visited[neighbor]) {\n        this.dfs_helper(neighbor, visited, result);\n    }\n}`;
                            break;
                        case 'cpp':
                        default:
                            safetyCheck = `if (startNode >= numVertices || startNode < 0) {\n    std::cout << "Error: Starting node does not exist!" << std::endl;\n    return;\n}`;
                            initVisited = `std::vector<bool> visited(numVertices, false);`;
                            callHelper = `dfs_helper(startNode, visited);`;
                            fieldWork = `visited[currentNode] = true;\nfor (int neighbor : adj[currentNode]) {\n    if (!visited[neighbor]) {\n        dfs_helper(neighbor, visited);\n    }\n}`;
                            break;
                    }
                    return `<h3>Depth-First Search (DFS)</h3>
<p><strong>Real-life Analogy: Mission Control Center and Field Agent</strong></p>
<p>Imagine that our exploration of the intricate old city has now reached a new level. It is no longer a lone tourist, but a professional expedition where duties are clearly divided between the Command Center (public function) and the Field Agent (private helper).</p>
<p>Here is how this process is logically broken down:</p>
<ul>
<li><pre><code>${safetyCheck}</code></pre><strong>Coordinates check by Headquarters (Safety check):</strong> When the order to begin exploration is received (calling the public function), the Command Center first looks at the map. If the client asks to start from an intersection that does not exist (a negative number or one larger than the size of the city), the mission is immediately canceled. Headquarters does not send people to nowhere.</li>
<li><pre><code>${initVisited}</code></pre><strong>Issuing equipment (Initializing visited):</strong> If the coordinates are correct, Headquarters prepares a completely new, blank notebook (the visited array) for the agent, where next to each intersection the status is set to "not visited" (false).</li>
<li><pre><code>${callHelper}</code></pre><strong>Delegating the work (Calling dfs_helper):</strong> Headquarters hands this notebook over to the Field Agent, specifies the starting point, and says: "Follow the instructions." At this point, the active work of Headquarters ends; it simply waits for the results.</li>
<li><pre><code>${fieldWork}</code></pre><strong>Fieldwork (Recursive helper):</strong> The Field Agent performs the exact same routine work we discussed earlier. They arrive at the location, make a mark in the notebook, report over the radio, inspect the neighboring streets, and, if they haven't been there yet, dive into them headfirst (recursive call).</li>
</ul>
<h3>Why is this approach better?</h3>
<p>It creates the perfect "service" for the end user. The person ordering the exploration doesn't need to go to the store themselves, buy a blank notebook, and hand it to the agent. The user simply says, "Start from node 5," and the program itself prepares all the necessary tools and triggers the hidden mechanisms.</p>
<h3>Efficiency Evaluation (Big O)</h3>
<p>Since it is the exact same algorithm under the hood, its efficiency remains unchanged:</p>
<p><strong>Time complexity:</strong> O(V + E)<br>
Where V is the number of vertices (intersections), and E is the number of edges (streets). The agent will still have to traverse the entire accessible territory, spending time proportional to its size.</p>
<p><strong>Space complexity:</strong> O(V)<br>
Memory is spent on the "notebook" with marks for each vertex and on maintaining communication with Headquarters (the recursive call stack when the agent goes into deep dead ends).</p>`;
                } else if (currentStructure.includes('graph')) {
                    let markVisited, checkNeighbors;
                    switch (progLang) {
                        case 'python':
                            markVisited = `visited[node] = True`;
                            checkNeighbors = `for neighbor in adj[node]:\n    if not visited[neighbor]:`;
                            break;
                        case 'java':
                            markVisited = `visited[node] = true;`;
                            checkNeighbors = `for (int neighbor : adj.get(node)) {\n    if (!visited[neighbor]) {`;
                            break;
                        case 'javascript':
                            markVisited = `visited[node] = true;`;
                            checkNeighbors = `for (const neighbor of adj[node]) {\n    if (!visited[neighbor]) {`;
                            break;
                        case 'cpp':
                        default:
                            markVisited = `visited[node] = true;`;
                            checkNeighbors = `for (int neighbor : adj[node]) {\n        if (!visited[neighbor]) {`;
                            break;
                    }
                    return `<h3>Depth-First Search (DFS)</h3>
<p><strong>Real-life Analogy: Exploring the Labyrinth of an Old City</strong></p>
<p>Imagine you are a tourist trying to explore absolutely all the narrow streets of an unfamiliar old city so as not to miss anything, but without walking in circles.</p>
<p>Here is how your exploration logic works (which perfectly matches the logic of the DFS algorithm):</p>
<ul>
<li><pre><code>${markVisited}</code></pre><strong>Chalk mark (Record of visit):</strong> When you arrive at a new intersection (in code, this is a <code>node</code>), you immediately draw a cross on the cobblestones with chalk and take a picture of this place (output to the screen). This is a signal to your future self: "I have already been here."</li>
<li><strong>Surveying available paths (Checking neighbors):</strong> You look at all the streets radiating from this intersection.</li>
<li><pre><code>${checkNeighbors}</code></pre><strong>Diving into the unknown (Recursive call):</strong> If you see a street leading to an intersection without your chalk mark, you do not stay to examine other turns. You immediately go down this new street as far as possible.</li>
<li><strong>Turning back (Backtracking):</strong> You keep going deeper until you find yourself in a dead end or at an intersection where all neighboring streets already have your chalk marks. What then? You simply take one step back (this happens automatically when the recursive function finishes its execution for the current point) and check if there are any other unexplored turns left at the previous intersection.</li>
</ul>
<p>The main feature of this approach lies in its name — "depth-first". You always try to advance as far as possible along one route before turning back and checking alternatives.</p>
<h3>Efficiency Evaluation (Big O)</h3>
<p><strong>Time complexity:</strong> O(V + E)</p>
<ul>
<li>V (Vertices) — is the number of intersections (nodes).</li>
<li>E (Edges) — is the number of streets between them (edges).</li>
</ul>
<p>The algorithm needs to visit every intersection and check every street once, so the execution time grows proportionally to the size of the entire map.</p>
<p><strong>Space complexity:</strong> O(V)<br>
We need additional memory to store the array of marks (where we have been). Furthermore, memory is consumed to maintain the backtracking chain itself (the recursion call stack). In the worst-case scenario (if all streets are lined up in one long straight line), we will have to keep all the nodes of the graph in memory simultaneously.</p>`;
                }
                return `Depth-First Search. Explores as far as possible along each branch before backtracking using a Stack (or recursion). Time Complexity: O(V + E).`;
            },
            'insert': 'Inserts a new value into the tree. Time Complexity: O(log n) for balanced trees, O(n) for skewed trees.',
            'remove': 'Removes a value from the tree. Time Complexity: O(log n) for balanced trees.',
            'search': 'Searches for a value in the tree. Time Complexity: O(log n) for balanced trees.'
        };
        const descUk = {
            'add_head': (progLang) => {
                if (currentStructure === 'circular-linked-list') {
                    let codeDef, newAlloc, checkEmpty, prepCursor, traverseLoop, linkTail, linkHead, returnNode;
                    switch (progLang) {
                        case 'python':
                            codeDef = `def add_head(head, data):`;
                            newAlloc = `new_node = Node(data)`;
                            checkEmpty = `if head is None:\n    new_node.next = new_node\n    return new_node`;
                            prepCursor = `current = head`;
                            traverseLoop = `while current.next != head:\n    current = current.next`;
                            linkTail = `current.next = new_node`;
                            linkHead = `new_node.next = head`;
                            returnNode = `return new_node`;
                            break;
                        case 'java':
                            codeDef = `Node addHead(Node head, int data)`;
                            newAlloc = `Node newNode = new Node(data);`;
                            checkEmpty = `if (head == null) {\n    newNode.next = newNode;\n    return newNode;\n}`;
                            prepCursor = `Node current = head;`;
                            traverseLoop = `while (current.next != head) {\n    current = current.next;\n}`;
                            linkTail = `current.next = newNode;`;
                            linkHead = `newNode.next = head;`;
                            returnNode = `return newNode;`;
                            break;
                        case 'javascript':
                            codeDef = `addHead(head, data) {`;
                            newAlloc = `let newNode = new Node(data);`;
                            checkEmpty = `if (head === null) {\n    newNode.next = newNode;\n    return newNode;\n}`;
                            prepCursor = `let current = head;`;
                            traverseLoop = `while (current.next !== head) {\n    current = current.next;\n}`;
                            linkTail = `current.next = newNode;`;
                            linkHead = `newNode.next = head;`;
                            returnNode = `return newNode;`;
                            break;
                        case 'cpp':
                        default:
                            codeDef = `Node* add_head(Node* head, int data)`;
                            newAlloc = `Node* new_node = new Node(data);`;
                            checkEmpty = `if (head == nullptr) {\n    new_node->next = new_node;\n    return new_node;\n}`;
                            prepCursor = `Node* current = head;`;
                            traverseLoop = `while (current->next != head) {\n    current = current->next;\n}`;
                            linkTail = `current->next = new_node;`;
                            linkHead = `new_node->next = head;`;
                            returnNode = `return new_node;`;
                            break;
                    }
                    return `<h3>Додавання елемента на початок кільцевого списку (<code>add_head</code>)</h3>
<p>Уявіть потяг, що їде по замкненому колу: його останній вагон завжди зчеплений з найпершим. Це і є Кільцевий зв'язний список (Circular Linked List).</p>
<p>Коли ми хочемо додати новий вагон на початок такого потяга, недостатньо просто причепити його перед першим вагоном. Ми обов'язково маємо також знайти самий останній вагон (Хвіст), щоб відчепити його від старого Головного вагона і перечепити до нашого нового!</p>
<h3>Покрокове пояснення коду:</h3>
<ul>
<li><pre><code>${codeDef}\n    ${newAlloc}</code></pre><strong>Створення нового вузла:</strong> Спершу програма виділяє пам'ять під новий "вагон" і завантажує в нього передані дані.</li>
<li><pre><code>${checkEmpty}</code></pre><strong>Перевірка на порожнечу (перший елемент):</strong> Це особливий сценарій. Якщо кільцевого списку ще не існує (Голова порожня), наш новий вузол стає найпершим і єдиним. Щоб замкнути коло, він повинен вказувати... сам на себе! Після цього він стає Головою, і операція завершується.</li>
<li><pre><code>${prepCursor}\n${traverseLoop}</code></pre><strong>Пошук останнього елемента:</strong> Якщо потяг уже існує, нам потрібно знайти його кінець. Програма створює вказівник-курсор і відправляє його від Голови по всьому списку. Курсор крокує вперед, поки не знайде вагон, який вказує на поточну Голову. Це і є наш Хвіст.</li>
<li><pre><code>${linkHead}\n${linkTail}</code></pre><strong>Перечеплення вагонів:</strong> Тепер у нас є все для додавання. Спочатку ми беремо наш новий вузол і вказуємо ним на поточну Голову (ставимо його попереду). Потім беремо знайдений Хвіст і перенаправляємо його вказівник на наш новий вузол (щоб кільце не розірвалося).</li>
<li><pre><code>${returnNode}</code></pre><strong>Оновлення статусу:</strong> Коли всі зв'язки оновлені, наш новий вузол офіційно визнається новою Головою кільцевого списку.</li>
</ul>
<h3>Часова складність:</h3>
<ul>
<li><strong>O(n) (Лінійний час):</strong> Незважаючи на те, що ми додаємо елемент у самий початок, швидкість виконання алгоритму залежить від загальної кількості елементів у кільці. Це відбувається виключно тому, що нам доводиться пробігати весь список від початку до кінця, тільки щоб знайти Хвіст і оновити його "зчеплення". Для списку з n елементів знадобиться n кроків. (Примітка: якби ми постійно зберігали окремий вказівник на Хвіст, цю операцію можна було б оптимізувати до миттєвого часу O(1)).</li>
</ul>`;
                }

                let codeDef, newVar, newAlloc, nextPtr, headPtr;
                switch (progLang) {
                    case 'python':
                        codeDef = `def add_head(self, data):`;
                        newVar = `new_node`;
                        newAlloc = `new_node = Node(data)`;
                        nextPtr = `new_node.next = self.head`;
                        headPtr = `self.head = new_node`;
                        break;
                    case 'java':
                        codeDef = `void insertAtHead(int val)`;
                        newVar = `newNode`;
                        newAlloc = `Node newNode = new Node(val);`;
                        nextPtr = `newNode.next = head;`;
                        headPtr = `head = newNode;`;
                        break;
                    case 'javascript':
                        codeDef = `addHead(data) {`;
                        newVar = `newNode`;
                        newAlloc = `const newNode = new Node(data);`;
                        nextPtr = `newNode.next = this.head;`;
                        headPtr = `this.head = newNode;`;
                        break;
                    case 'cpp':
                    default:
                        codeDef = `void insertAtHead(int val)`;
                        newVar = `newNode`;
                        newAlloc = `Node* newNode = new Node(val);`;
                        nextPtr = `newNode->next = head;`;
                        headPtr = `head = newNode;`;
                        break;
                }
                return `<h3>Покрокове пояснення коду:</h3>
<ul>
<li><code>${codeDef}</code><br>Ми оголошуємо функцію, яка приймає один параметр <code>val</code> — це значення (наприклад, число), яке ми хочемо зберегти в нашому новому вузлі.</li>
<li><code>${newAlloc}</code><br><strong>Створення нового вузла.</strong> Програма виділяє пам'ять для нового елемента та записує в нього наше значення <code>val</code>. На цьому етапі новий вузол існує ізольовано, він ще не підключений до основного списку.</li>
<li><code>${nextPtr}</code><br><strong>Зв'язування нового вузла зі списком.</strong> Ми беремо вказівник <code>next</code> нашого нового вузла і направляємо його на поточну <code>head</code> (Голову) списку. Іншими словами, ми кажемо: "Наступним елементом після нового буде той, що зараз є першим".</li>
<li><code>${headPtr}</code><br><strong>Оновлення Голови списку.</strong> Оскільки наш новий вузол тепер стоїть перед усіма іншими, ми повинні оновити вказівник <code>head</code>, щоб він вказував на цей <code>${newVar}</code>. Тепер він офіційно є першим елементом!</li>
</ul>
<h3>Часова складність: O(1)</h3>
<p>Операція додавання на початок виконується за константний час — O(1).<br>Це означає, що швидкість виконання цієї функції не залежить від того, скільки елементів вже є у списку (чи їх 10, чи 10 мільйонів). Нам завжди потрібно виконати лише три дії: створити вузол, перенаправити один вказівник і оновити <code>head</code>. Це робить однозв'язний список ідеальним вибором, коли вам потрібно часто додавати елементи на початок.</p>`;
            },

            'add_tail': (progLang) => {
                if (currentStructure === 'circular-linked-list') {
                    let codeDef, newAlloc, checkEmpty, prepCursor, traverseLoop, linkTail, linkHead;
                    switch (progLang) {
                        case 'python':
                            codeDef = `def add_tail(self, data):`;
                            newAlloc = `new_node = Node(data)`;
                            checkEmpty = `if self.head is None:\n    self.head = new_node\n    new_node.next = self.head\n    return`;
                            prepCursor = `temp = self.head`;
                            traverseLoop = `while temp.next != self.head:\n    temp = temp.next`;
                            linkTail = `temp.next = new_node`;
                            linkHead = `new_node.next = self.head`;
                            break;
                        case 'java':
                            codeDef = `void add_tail(int data)`;
                            newAlloc = `Node new_node = new Node(data);`;
                            checkEmpty = `if (head == null) {\n    head = new_node;\n    new_node.next = head;\n    return;\n}`;
                            prepCursor = `Node temp = head;`;
                            traverseLoop = `while (temp.next != head) {\n    temp = temp.next;\n}`;
                            linkTail = `temp.next = new_node`;
                            linkHead = `new_node.next = head`;
                            break;
                        case 'javascript':
                            codeDef = `add_tail(data) {`;
                            newAlloc = `let new_node = new Node(data);`;
                            checkEmpty = `if (this.head === null) {\n    this.head = new_node;\n    new_node.next = this.head;\n    return;\n}`;
                            prepCursor = `let temp = this.head;`;
                            traverseLoop = `while (temp.next !== this.head) {\n    temp = temp.next;\n}`;
                            linkTail = `temp.next = new_node`;
                            linkHead = `new_node.next = this.head`;
                            break;
                        case 'cpp':
                        default:
                            codeDef = `void add_tail(int data)`;
                            newAlloc = `Node* new_node = new Node(data);`;
                            checkEmpty = `if (head == nullptr) {\n    head = new_node;\n    new_node->next = head;\n    return;\n}`;
                            prepCursor = `Node* temp = head;`;
                            traverseLoop = `while (temp->next != head) {\n    temp = temp->next;\n}`;
                            linkTail = `temp->next = new_node`;
                            linkHead = `new_node->next = head`;
                            break;
                    }
                    return `<h3>Додавання елемента в кінець кільцевого списку (<code>add_tail</code>)</h3>
<p>Як ми вже з'ясували, кільцевий список — це потяг, що їде по замкненому колу, де останній вагон завжди зчеплений з першим (Головою). Якщо ми хочемо додати новий вагон у самий кінець цього потяга, нам потрібно знайти місце "зчеплення" між кінцем і початком, розірвати його, вставити наш новий вагон і знову замкнути коло.</p>
<h3>Покрокове пояснення коду:</h3>
<ul>
<li><pre><code>${codeDef}\n    ${newAlloc}</code></pre><strong>Створення нового вузла:</strong> Алгоритм починається з того, що виділяє пам'ять для нового "вагона" і завантажує в нього передану інформацію.</li>
<li><pre><code>${checkEmpty}</code></pre><strong>Створення першого кільця (якщо список порожній):</strong> Спочатку програма перевіряє, чи існує потяг взагалі. Якщо Голова порожня, наш новий вагон стає найпершим елементом. Але оскільки список має бути кільцевим, цей єдиний вагон одразу з'єднується сам із собою (його вказівник направлений на самого себе). На цьому додавання успішно завершується.</li>
<li><pre><code>${prepCursor}\n${traverseLoop}</code></pre><strong>Пошук старого Хвоста:</strong> Якщо в потязі вже є інші вагони, нам потрібно знайти найостанніший. Програма створює тимчасовий курсор, ставить його на Голову і починає рух вперед. Курсор крокує від вагона до вагона, поки не знайде той, який вказує назад на Голову. Це і є наш старий Хвіст.</li>
<li><pre><code>${linkTail}</code></pre><strong>Вбудовування нового вагона:</strong> Знайшовши останній елемент, ми від'єднуємо його вказівник від Голови і направляємо на наш новий вагон. Тепер новий вагон став останнім у черзі.</li>
<li><pre><code>${linkHead}</code></pre><strong>Замикання кола:</strong> Щоб структура не зламалася і залишилася кільцевою, ми беремо вказівник нашого нового (тепер вже останнього) вагона і направляємо його на Голову списку. Коло знову замкнулося!</li>
</ul>
<h3>Часова складність:</h3>
<ul>
<li><strong>O(n) (Лінійний час):</strong> Оскільки ми маємо прямий доступ лише до початку списку, алгоритм змушений пройти через кожен елемент, щоб дістатися кінця кільця. Швидкість виконання прямо залежить від кількості вузлів: чим довший список, тим довше курсор шукатиме останній елемент. <em>(Невелика підказка: якби структура списку спеціально зберігала додатковий постійний вказівник на Хвіст, цю операцію можна було б прискорити до миттєвого часу O(1), оскільки нам більше не довелося б пробігати через весь потяг).</em></li>
</ul>`;
                }

                let codeDef, newAlloc, checkEmpty, prepCursor, traverseLoop, appendNode;
                switch (progLang) {
                    case 'python':
                        codeDef = `def add_tail(self, data):`;
                        newAlloc = `new_node = Node(data)`;
                        checkEmpty = `if not self.head: self.head = new_node; return`;
                        prepCursor = `temp = self.head`;
                        traverseLoop = `while temp.next: temp = temp.next`;
                        appendNode = `temp.next = new_node`;
                        break;
                    case 'java':
                        codeDef = `void insertAtTail(int val)`;
                        newAlloc = `Node newNode = new Node(val);`;
                        checkEmpty = `if (head == null) { head = newNode; return; }`;
                        prepCursor = `Node temp = head;`;
                        traverseLoop = `while (temp.next != null) { temp = temp.next; }`;
                        appendNode = `temp.next = newNode;`;
                        break;
                    case 'javascript':
                        codeDef = `addTail(data) {`;
                        newAlloc = `const newNode = new Node(data);`;
                        checkEmpty = `if (!this.head) { this.head = newNode; return; }`;
                        prepCursor = `let temp = this.head;`;
                        traverseLoop = `while (temp.next) { temp = temp.next; }`;
                        appendNode = `temp.next = newNode;`;
                        break;
                    case 'cpp':
                    default:
                        codeDef = `void insertAtTail(int val)`;
                        newAlloc = `Node* newNode = new Node(val);`;
                        checkEmpty = `if (head == nullptr) { head = newNode; return; }`;
                        prepCursor = `Node* temp = head;`;
                        traverseLoop = `while (temp->next != nullptr) { temp = temp->next; }`;
                        appendNode = `temp->next = newNode;`;
                        break;
                }
                return `<h3>Додавання елемента в кінець (<code>insertAtTail</code>)</h3>
<p>В однозв'язному списку кожен вузол містить інформацію лише про елемент, який йде безпосередньо за ним. Тому, якщо ми хочемо додати новий вузол у самий кінець, маючи лише інформацію про початок списку (Голову), нам доведеться "пройти" всі існуючі елементи, крок за кроком, щоб знайти останній.</p>
<h3>Покрокове пояснення коду:</h3>
<ul>
<li><code>${newAlloc}</code><br><strong>Створення нового вузла:</strong> Спочатку програма виділяє пам'ять для нового елемента та записує в нього передане значення. Поки що цей вузол існує ізольовано і не є частиною списку.</li>
<li><code>${checkEmpty}</code><br><strong>Перевірка на порожній список:</strong> Далі алгоритм перевіряє, чи існує список взагалі. Якщо Голова порожня (в списку немає елементів), то наш новий вузол автоматично стає першим і єдиним елементом. Він призначається Головою, і на цьому операція завершується.</li>
<li><code>${prepCursor}</code><br><strong>Підготовка до пошуку кінця:</strong> Якщо в списку вже є елементи, нам потрібно знайти останній. Для цього створюється тимчасовий "вказівник-курсор", який ми спочатку встановлюємо на Голову списку.</li>
<li><code>${traverseLoop}</code><br><strong>Пошук останнього елемента:</strong> Запускається цикл, який перевіряє: чи має поточний вузол зв'язок з наступним? Якщо так, наш курсор робить один крок вперед. Цей процес триває, поки ми не дійдемо до вузла, який нікуди не вказує (його зв'язок порожній). Це і є поточний кінець списку.</li>
<li><code>${appendNode}</code><br><strong>Приєднання нового вузла:</strong> Коли останній елемент знайдено, ми беремо його вказівник і направляємо на наш новостворений елемент. Тепер новий вузол успішно приєднано до кінця!</li>
</ul>
<h3>Часова складність:</h3>
<ul>
<li><strong>O(n) для стандартного підходу:</strong> Оскільки ми повинні пройти від першого до останнього елемента, швидкість виконання алгоритму прямо залежить від довжини списку. Якщо в списку n елементів, програмі потрібно зробити n кроків.</li>
<li><strong>O(1) з вказівником на хвіст:</strong> Якби наша структура списку, крім Голови, постійно зберігала окремий вказівник на Хвіст (останній елемент), ми могли б приєднувати новий вузол миттєво, уникаючи довгого пошуку. У цьому випадку швидкість виконання була б константною і не залежала б від кількості елементів.</li>
</ul>`;
            },

            'insert_at': (progLang) => {
                if (currentStructure === 'circular-linked-list') {
                    let codeDef, sanityCheck, scenario1, scenario2, scenario3, protection, recoupling;
                    switch (progLang) {
                        case 'python':
                            codeDef = `def insert_at(self, position, data):`;
                            sanityCheck = `if position < 0:\n    print("Invalid position.")\n    return\nnew_node = Node(data)`;
                            scenario1 = `if self.head is None:\n    if position == 0:\n        self.head = new_node\n        new_node.next = self.head\n    else:\n        print(f"Position {position} is out of bounds...")\n    return`;
                            scenario2 = `if position == 0:\n    temp = self.head\n    while temp.next != self.head:\n        temp = temp.next\n    new_node.next = self.head\n    temp.next = new_node\n    self.head = new_node\n    return`;
                            scenario3 = `temp = self.head\ncurrent_pos = 0\nwhile current_pos < position - 1:\n    temp = temp.next\n    current_pos += 1`;
                            protection = `    if temp == self.head:\n        print(f"Position {position} is out of bounds.")\n        return`;
                            recoupling = `new_node.next = temp.next\ntemp.next = new_node`;
                            break;
                        case 'java':
                            codeDef = `void insert_at(int position, int data)`;
                            sanityCheck = `if (position < 0) {\n    System.out.println("Invalid position.");\n    return;\n}\nNode new_node = new Node(data);`;
                            scenario1 = `if (head == null) {\n    if (position == 0) {\n        head = new_node;\n        new_node.next = head;\n    } else {\n        System.out.println("Position " + position + " is out of bounds...");\n    }\n    return;\n}`;
                            scenario2 = `if (position == 0) {\n    Node temp = head;\n    while (temp.next != head) {\n        temp = temp.next;\n    }\n    new_node.next = head;\n    temp.next = new_node;\n    head = new_node;\n    return;\n}`;
                            scenario3 = `Node temp = head;\nint current_pos = 0;\nwhile (current_pos < position - 1) {\n    temp = temp.next;\n    current_pos++;`;
                            protection = `    if (temp == head) {\n        System.out.println("Position " + position + " is out of bounds.");\n        return;\n    }\n}`;
                            recoupling = `new_node.next = temp.next;\ntemp.next = new_node;`;
                            break;
                        case 'javascript':
                            codeDef = `insert_at(position, data) {`;
                            sanityCheck = `if (position < 0) {\n    console.log("Invalid position.");\n    return;\n}\nlet new_node = new Node(data);`;
                            scenario1 = `if (this.head === null) {\n    if (position === 0) {\n        this.head = new_node;\n        new_node.next = this.head;\n    } else {\n        console.log(\`Position \${position} is out of bounds...\`);\n    }\n    return;\n}`;
                            scenario2 = `if (position === 0) {\n    let temp = this.head;\n    while (temp.next !== this.head) {\n        temp = temp.next;\n    }\n    new_node.next = this.head;\n    temp.next = new_node;\n    this.head = new_node;\n    return;\n}`;
                            scenario3 = `let temp = this.head;\nlet current_pos = 0;\nwhile (current_pos < position - 1) {\n    temp = temp.next;\n    current_pos++;`;
                            protection = `    if (temp === this.head) {\n        console.log(\`Position \${position} is out of bounds.\`);\n        return;\n    }\n}`;
                            recoupling = `new_node.next = temp.next;\ntemp.next = new_node;`;
                            break;
                        case 'cpp':
                        default:
                            codeDef = `void insert_at(int position, int data)`;
                            sanityCheck = `if (position < 0) {\n    std::cout << "Invalid position." << std::endl;\n    return;\n}\nNode* new_node = new Node(data);`;
                            scenario1 = `if (head == nullptr) {\n    if (position == 0) {\n        head = new_node;\n        new_node->next = head;\n    } else {\n        std::cout << "Position " << position << " is out of bounds...";\n        delete new_node;\n    }\n    return;\n}`;
                            scenario2 = `if (position == 0) {\n    Node* temp = head;\n    while (temp->next != head) {\n        temp = temp->next;\n    }\n    new_node->next = head;\n    temp->next = new_node;\n    head = new_node;\n    return;\n}`;
                            scenario3 = `Node* temp = head;\nint current_pos = 0;\nwhile (current_pos < position - 1) {\n    temp = temp->next;\n    current_pos++;`;
                            protection = `    if (temp == head) {\n        std::cout << "Position " << position << " is out of bounds.";\n        delete new_node;\n        return;\n    }\n}`;
                            recoupling = `new_node->next = temp->next;\ntemp->next = new_node;`;
                            break;
                    }
                    return `<h3>Вставка елемента на задану позицію в кільцевому списку (<code>insert_at</code>)</h3>
<p>Іноді виникає потреба додати новий вузол (вагон) не на самий початок або кінець, а в конкретне місце — наприклад, зробити його третім або п'ятим за порядком. Оскільки наш список кільцевий (останній вагон з'єднаний з першим), алгоритм має бути дуже обережним, щоб випадково не розірвати це нескінченне коло, звільняючи місце між вагонами, або не піти нескінченно по колу в пошуках неіснуючого місця.</p>
<h3>Покрокове пояснення коду:</h3>
<ul>
<li><pre><code>${codeDef}\n    ${sanityCheck}</code></pre><strong>Базова перевірка (Sanity check):</strong> Перш за все, програма перевіряє базову логіку: чи не запросив користувач від'ємну позицію (наприклад, -5)? Якщо так, виводиться помилка, і процес зупиняється. Якщо позиція правильна, створюється новий ізольований вузол з даними.</li>
<li><pre><code>${scenario1}</code></pre><strong>Сценарій 1: Список порожній.</strong> Якщо потяг ще не існує, єдине логічне місце для вставки — найперша позиція (0). У цьому випадку новий вузол стає Головою і одразу з'єднується сам із собою, утворюючи міні-кільце. Якщо ж для порожнього списку була запитана 10-та позиція, це помилка виходу за межі. Алгоритм повідомить про це і знищить новий вузол, щоб не засмічувати пам'ять комп'ютера.</li>
<li><pre><code>${scenario2}</code></pre><strong>Сценарій 2: Вставка на самий початок (Позиція 0).</strong> Якщо вагони вже є, і ми хочемо вставити новий перед самим першим, доведеться трохи попрацювати. Недостатньо просто поставити новий вагон перед Головою. Оскільки коло замкнуте, програма відправляє курсор у самий кінець списку, щоб знайти Хвіст. Знайшовши його, вона від'єднує Хвіст від старої Голови і перечіплює його до нашого нового вузла. Лише після цього коло знову вважається цілим, і новий вузол стає новою Головою.</li>
<li><pre><code>${scenario3}</code></pre><strong>Сценарій 3: Вставка в середину (Позиція &gt; 0).</strong> Якщо місце знаходиться десь посередині, програма відправляє курсор від початку списку. Його завдання — робити кроки вперед і зупинитися рівно на тому вагоні, який буде стояти перед нашим новим.</li>
<li><pre><code>${protection}</code></pre><strong>Захист від "бігу по колу":</strong> Під час пошуку потрібного місця є одна небезпека. У звичайному списку ми просто доходимо до кінця і бачимо "глухий кут". У кільцевому списку курсор може непомітно піти на друге коло! Щоб запобігти цьому, алгоритм слідкує: якщо під час крокування ми знову натрапили на Голову (тобто пройшли по колу), а потрібна позиція не досягнута — це означає, що запитане місце знаходиться за межами реальної довжини списку. У цьому випадку операція скасовується.</li>
<li><pre><code>${recoupling}</code></pre><strong>Перечеплення:</strong> Якщо правильне місце знайдено, ми беремо наш новий вузол, направляємо його вказівник на наступну частину потяга, а вагон, на якому стоїть курсор, перенаправляємо на наш новий. Новий елемент успішно інтегровано в кільце!</li>
</ul>
<h3>Часова складність:</h3>
<ul>
<li><strong>O(n) для більшості випадків:</strong> Швидкість виконання прямо залежить від кількості елементів і бажаної позиції. Якщо ви вставляєте елемент в середину, програмі потрібно зробити відповідну кількість кроків. Якщо ви вставляєте на позицію 0, програмі доведеться пройти весь список, щоб знайти Хвіст.</li>
<li><strong>O(1) у винятковому випадку:</strong> Операція виконується миттєво лише тоді, коли список абсолютно порожній, і ми вставляємо елемент на нульову позицію.</li>
</ul>`;
                }

                let codeDef, newAlloc, checkZero, prepCursor, checkBounds, insertNode;
                switch (progLang) {
                    case 'python':
                        codeDef = `def insert_at(self, position, data):`;
                        newAlloc = `new_node = Node(data)`;
                        checkZero = `if position == 0:\n    new_node.next = self.head\n    self.head = new_node\n    return`;
                        prepCursor = `current = self.head\nfor _ in range(position - 1):\n    if current is None: raise IndexError("...")\n    current = current.next`;
                        checkBounds = `if current is None:\n    raise IndexError("Position out of bounds")`;
                        insertNode = `new_node.next = current.next\ncurrent.next = new_node`;
                        break;
                    case 'java':
                        codeDef = `void insertAt(int position, int data)`;
                        newAlloc = `Node newNode = new Node(data);`;
                        checkZero = `if (position == 0) {\n    newNode.next = head;\n    head = newNode;\n    return;\n}`;
                        prepCursor = `Node current = head;\nfor (int i = 0; i < position - 1; i++) {\n    if (current == null) throw new IndexOutOfBoundsException("...");\n    current = current.next;\n}`;
                        checkBounds = `if (current == null) {\n    throw new IndexOutOfBoundsException("Position out of bounds");\n}`;
                        insertNode = `newNode.next = current.next;\ncurrent.next = newNode;`;
                        break;
                    case 'javascript':
                        codeDef = `insertAt(position, data) {`;
                        newAlloc = `const newNode = new Node(data);`;
                        checkZero = `if (position === 0) {\n    newNode.next = this.head;\n    this.head = newNode;\n    return;\n}`;
                        prepCursor = `let current = this.head;\nfor (let i = 0; i < position - 1; i++) {\n    if (current === null) throw new Error("...");\n    current = current.next;\n}`;
                        checkBounds = `if (current === null) {\n    throw new Error("Position out of bounds");\n}`;
                        insertNode = `newNode.next = current.next;\ncurrent.next = newNode;`;
                        break;
                    case 'cpp':
                    default:
                        codeDef = `Node* insert_at(Node* head, int position, int data)`;
                        newAlloc = `Node* new_node = new Node(data);`;
                        checkZero = `if (position == 0) {\n    new_node->next = head;\n    return new_node;\n}`;
                        prepCursor = `Node* current = head;\nfor (int i = 0; i < position - 1; ++i) {\n    if (current == nullptr) throw std::out_of_range("...");\n    current = current->next;\n}`;
                        checkBounds = `if (current == nullptr) {\n    delete new_node;\n    throw std::out_of_range("Position out of bounds");\n}`;
                        insertNode = `new_node->next = current->next;\ncurrent->next = new_node;`;
                        break;
                }
                return `<h3>Вставка елемента на задану позицію (<code>insert_at</code>)</h3>
<p>Іноді виникає потреба додати новий вузол не на початок або в кінець списку, а десь посередині — наприклад, зробити його третім або п'ятим за порядком. В однозв'язному списку ми не можемо просто "перестрибнути" в потрібне місце. Ми повинні послідовно пройти від початку, щоб знайти вузол, який буде стояти безпосередньо перед нашим новим елементом.</p>
<h3>Покрокове пояснення коду:</h3>
<ul>
<li><pre><code>${newAlloc}</code></pre><strong>Створення нового вузла:</strong> Спочатку алгоритм виділяє пам'ять для нового елемента та поміщає в нього передане значення. Поки що цей вузол ізольований від основного списку.</li>
<li><pre><code>${checkZero}</code></pre><strong>Перевірка на вставку на початок (позиція 0):</strong> Якщо користувач вказав нульову позицію, це означає, що елемент має стати самим першим. Це найпростіший сценарій: новий вузол просто приєднується до поточної Голови списку і сам стає новою Головою. На цьому алгоритм успішно завершує свою роботу.</li>
<li><pre><code>${prepCursor}</code></pre><strong>Пошук попереднього елемента:</strong> Якщо позиція більша за нуль, нам потрібно знайти місце для "розриву". Для цього використовується тимчасовий вказівник-курсор, який починає свій шлях від Голови. Він робить кроки вперед по списку рівно стільки разів, щоб зупинитися за один крок до цільової позиції.</li>
<li><pre><code>${checkBounds}</code></pre><strong>Захист від помилок (вихід за межі):</strong> Під час переходу від вузла до вузла алгоритм постійно перевіряє, чи не закінчився список. Якщо ви спробуєте вставити елемент на 10-ту позицію, а в списку їх лише три, це помилка. У цьому випадку програма видаляє наш ізольований новий вузол (щоб запобігти витоку пам'яті) і виводить повідомлення про помилку (вихід за межі).</li>
<li><pre><code>${insertNode}</code></pre><strong>Вбудовування нового вузла:</strong> Коли курсор зупиняється на правильному попередньому елементі, відбувається "перечеплення вагонів". Спочатку ми беремо новий вузол і вказуємо йому на ту частину списку, яка йде після курсора. Потім ми беремо елемент під курсором і перенаправляємо його вказівник на наш новий вузол. Ланцюг успішно з'єднано!</li>
</ul>
<h3>Часова складність:</h3>
<ul>
<li><strong>O(n) для більшості випадків:</strong> Швидкість виконання залежить від того, наскільки глибоко в списку знаходиться потрібне місце. Чим більша позиція вставки, тим більше кроків потрібно зробити курсору. У найгіршому випадку йому доведеться пройти майже весь список.</li>
<li><strong>O(1) у найкращому випадку:</strong> Якщо вам потрібно вставити елемент на позицію 0 (на самий початок), операція виконується миттєво, оскільки нам не потрібно перебирати інші елементи.</li>
</ul>`;
            },

            'remove_head': (progLang) => {
                if (currentStructure === 'circular-linked-list') {
                    let codeDef, checkEmpty, singleCar, saveOldHead, findTail, updateHead, closeCircle, clearMemory, gcNote;
                    switch (progLang) {
                        case 'python':
                            codeDef = `def remove_head(self):`;
                            checkEmpty = `if self.head is None:\n    print("List is empty. Nothing to remove.")\n    return`;
                            singleCar = `if self.head.next == self.head:\n    self.head = None\n    return`;
                            saveOldHead = `old_head = self.head\nlast = self.head`;
                            findTail = `while last.next != self.head:\n    last = last.next`;
                            updateHead = `self.head = self.head.next`;
                            closeCircle = `last.next = self.head`;
                            clearMemory = ``;
                            gcNote = ` (автоматично обробляється збирачем сміття в Python)`;
                            break;
                        case 'java':
                            codeDef = `void remove_head()`;
                            checkEmpty = `if (head == null) {\n    System.out.println("List is empty...");\n    return;\n}`;
                            singleCar = `if (head.next == head) {\n    head = null;\n    return;\n}`;
                            saveOldHead = `Node old_head = head;\nNode last = head;`;
                            findTail = `while (last.next != head) {\n    last = last.next;\n}`;
                            updateHead = `head = head.next;`;
                            closeCircle = `last.next = head;`;
                            clearMemory = ``;
                            gcNote = ` (автоматично обробляється збирачем сміття в Java)`;
                            break;
                        case 'javascript':
                            codeDef = `remove_head() {`;
                            checkEmpty = `if (this.head === null) {\n    console.log("List is empty...");\n    return;\n}`;
                            singleCar = `if (this.head.next === this.head) {\n    this.head = null;\n    return;\n}`;
                            saveOldHead = `let old_head = this.head;\nlet last = this.head;`;
                            findTail = `while (last.next !== this.head) {\n    last = last.next;\n}`;
                            updateHead = `this.head = this.head.next;`;
                            closeCircle = `last.next = this.head;`;
                            clearMemory = ``;
                            gcNote = ` (автоматично обробляється збирачем сміття в JavaScript)`;
                            break;
                        case 'cpp':
                        default:
                            codeDef = `void remove_head()`;
                            checkEmpty = `if (head == nullptr) {\n    std::cout << "List is empty...";\n    return;\n}`;
                            singleCar = `if (head->next == head) {\n    delete head;\n    head = nullptr;\n    return;\n}`;
                            saveOldHead = `Node* old_head = head;\nNode* last = head;`;
                            findTail = `while (last->next != head) {\n    last = last->next;\n}`;
                            updateHead = `head = head->next;`;
                            closeCircle = `last->next = head;`;
                            clearMemory = `delete old_head;`;
                            gcNote = ``;
                            break;
                    }
                    const clearMemoryHtml = clearMemory ? `<pre><code>${clearMemory}</code></pre>` : '';
                    return `<h3>Видалення елемента з початку кільцевого списку (<code>remove_head</code>)</h3>
<p>У звичайному лінійному списку видалити перший елемент дуже просто — достатньо лише сказати, що тепер список починається з другого вагона. Але в кільцевому списку все трохи складніше. Оскільки самий останній вагон потяга завжди зчеплений з найпершим, ми не можемо просто так прибрати Голову. Нам потрібно обов'язково знайти Хвіст і перечепити його до нової Голови, щоб наше кільце не розірвалося!</p>
<h3>Покрокове пояснення коду:</h3>
<ul>
<li><pre><code>${codeDef}\n    ${checkEmpty}</code></pre><strong>Перевірка на порожнечу:</strong> Перш за все, програма перевіряє, чи є взагалі що видаляти. Якщо список порожній (Голови немає), вона просто виводить повідомлення, що потяга не існує, і завершує роботу.</li>
<li><pre><code>${singleCar}</code></pre><strong>Сценарій одного вагона:</strong> Це особливий випадок. Якщо в списку лише один елемент, який замкнутий сам на себе (його "наступник" — це він сам), то після його видалення не залишиться нічого. Програма просто знищує цей вагон і офіційно оголошує список порожнім.</li>
<li><pre><code>${saveOldHead}</code></pre><strong>Підготовка до видалення (кілька вагонів):</strong> Якщо вагонів кілька, ми не можемо одразу видалити перший. Спочатку програма "запам'ятовує" поточну Голову, щоб потім правильно стерти її з пам'яті.</li>
<li><pre><code>${findTail}</code></pre><strong>Пошук Хвоста:</strong> Алгоритм відправляє пошуковий курсор від початку списку. Цей курсор пробігає по всіх вагонах до самого кінця, поки не знайде той, чиє "зчеплення" вказує на нашу поточну Голову. Це і є останній вагон.</li>
<li><pre><code>${updateHead}</code></pre><strong>Оновлення Голови:</strong> Тепер ми передаємо статус "Голови потяга" другому вагону. Відтепер він вважається новим початком.</li>
<li><pre><code>${closeCircle}</code></pre><strong>Замикання кола:</strong> Ми беремо знайдений останній вагон і направляємо його вказівник на нашу нову Голову. Кільце знову надійно замкнуте!</li>
<li>${clearMemoryHtml}<strong>Очищення пам'яті:</strong> Лише тепер, коли всі зв'язки оновлено, і старий перший вагон більше ніким не використовується, програма остаточно знищує його, звільняючи пам'ять комп'ютера.${gcNote}</li>
</ul>
<h3>Часова складність:</h3>
<ul>
<li><strong>O(n) (Лінійний час):</strong> Видалення з початку в кільцевому списку займає більше часу, ніж у звичайному. Вся проблема у Хвості — щоб оновити його "зчеплення", програма змушена пробігти через весь список від першого до останнього елемента. Тому для списку з n елементів їй доведеться зробити n кроків.<br><em>(Як і при додаванні, якби ми постійно зберігали окремий вказівник на Хвіст, ми б уникнули цього довгого пошуку, і швидкість була б миттєвою — O(1)).</em></li>
</ul>`;
                }

                let codeDef, checkEmpty, saveOld, updateHead, clearMemory, gcNote;
                switch (progLang) {
                    case 'python':
                        codeDef = `def remove_head(self):`;
                        checkEmpty = `if self.head:`;
                        saveOld = ``;
                        updateHead = `    self.head = self.head.next`;
                        clearMemory = ``;
                        gcNote = ` (автоматично обробляється збирачем сміття в Python)`;
                        break;
                    case 'java':
                        codeDef = `void removeHead()`;
                        checkEmpty = `if(head != null) {`;
                        saveOld = ``;
                        updateHead = `    head = head.next;`;
                        clearMemory = `}`;
                        gcNote = ` (автоматично обробляється збирачем сміття в Java)`;
                        break;
                    case 'javascript':
                        codeDef = `removeHead() {`;
                        checkEmpty = `if(this.head) {`;
                        saveOld = ``;
                        updateHead = `    this.head = this.head.next;`;
                        clearMemory = `}`;
                        gcNote = ` (автоматично обробляється збирачем сміття в JavaScript)`;
                        break;
                    case 'cpp':
                    default:
                        codeDef = `void removeHead()`;
                        checkEmpty = `if(!head) return;`;
                        saveOld = `Node* temp = head;`;
                        updateHead = `head = head->next;`;
                        clearMemory = `delete temp;`;
                        gcNote = ``;
                        break;
                }

                const saveOldHtml = saveOld ? `<pre><code>${saveOld}</code></pre>` : '';
                const clearMemoryHtml = clearMemory && progLang === 'cpp' ? `<pre><code>${clearMemory}</code></pre>` : '';

                return `<h3>Видалення елемента з початку (<code>removeHead</code>)</h3>
<p>Видалення першого вузла (Голови) — одна з найшвидших базових операцій в однозв'язному списку. Оскільки ми завжди маємо прямий "вхід" до структури через Голову, нам не потрібно нічого перебирати чи шукати, щоб від'єднати самий перший елемент.</p>
<h3>Покрокове пояснення коду:</h3>
<ul>
<li><pre><code>${checkEmpty}</code></pre><strong>Перевірка на порожнечу:</strong> Перш за все, алгоритм завжди перевіряє, чи не порожній наш список. Якщо Голова не існує (список порожній), то й видаляти нічого. У цьому випадку функція просто завершує роботу, щоб уникнути системних помилок.</li>
<li>${saveOldHtml}<strong>Збереження старого початку:</strong> Якщо елементи є, нам потрібно тимчасово запам'ятати вузол, який ми збираємося видалити. Програма створює "тимчасовий вказівник" і направляє його на поточну Голову. Це робиться для того, щоб ми не "загубили" цей вузол в пам'яті комп'ютера після того, як від'єднаємо його від списку.${gcNote}</li>
<li><pre><code>${updateHead}</code></pre><strong>Оновлення Голови списку:</strong> Тепер відбувається власне "від'єднання". Ми беремо вказівник Голови і зсуваємо його на один крок вперед — на елемент, який був другим. Іншими словами, ми кажемо програмі: "Забудь про старий перший вагон; тепер потяг починається з другого".</li>
<li>${clearMemoryHtml}<strong>Очищення пам'яті:</strong> Старий перший елемент тепер офіційно більше не є частиною нашого списку. Щоб він не висів у системі як "мертвий вантаж", програма використовує той самий тимчасовий вказівник (з кроку 2), щоб назавжди знищити цей вузол і звільнити оперативну пам'ять комп'ютера. Цей процес допомагає уникнути так званих "витоків пам'яті".${gcNote}</li>
</ul>
<h3>Часова складність:</h3>
<ul>
<li><strong>O(1) (Константний час):</strong> Швидкість видалення елемента з початку завжди однакова і миттєва. Комп'ютеру байдуже, чи у списку 10 елементів, чи 10 мільйонів. Від'єднання першого вузла завжди вимагає виконання лише фіксованої кількості кроків: перевірки списку, переміщення одного вказівника та видалення одного об'єкта.</li>
</ul>`;
            },

            'remove_tail': (progLang) => {
                if (currentStructure === 'circular-linked-list') {
                    let codeDef, checkEmpty, singleCar, findPenultimate, closeCircle, clearMemory, gcNote;
                    switch (progLang) {
                        case 'python':
                            codeDef = `def remove_tail(self):`;
                            checkEmpty = `if self.head is None:\n    print("List is empty. Nothing to remove.")\n    return`;
                            singleCar = `if self.head.next == self.head:\n    self.head = None\n    return`;
                            findPenultimate = `temp = self.head\nwhile temp.next.next != self.head:\n    temp = temp.next`;
                            closeCircle = `temp.next = self.head`;
                            clearMemory = ``;
                            gcNote = ` (автоматично обробляється збирачем сміття в Python)`;
                            break;
                        case 'java':
                            codeDef = `void remove_tail()`;
                            checkEmpty = `if (head == null) {\n    System.out.println("List is empty. Nothing to remove.");\n    return;\n}`;
                            singleCar = `if (head.next == head) {\n    head = null;\n    return;\n}`;
                            findPenultimate = `Node temp = head;\nwhile (temp.next.next != head) {\n    temp = temp.next;\n}`;
                            closeCircle = `temp.next = head;`;
                            clearMemory = ``;
                            gcNote = ` (автоматично обробляється збирачем сміття в Java)`;
                            break;
                        case 'javascript':
                            codeDef = `remove_tail() {`;
                            checkEmpty = `if (this.head === null) {\n    console.log("List is empty. Nothing to remove.");\n    return;\n}`;
                            singleCar = `if (this.head.next === this.head) {\n    this.head = null;\n    return;\n}`;
                            findPenultimate = `let temp = this.head;\nwhile (temp.next.next !== this.head) {\n    temp = temp.next;\n}`;
                            closeCircle = `temp.next = this.head;`;
                            clearMemory = ``;
                            gcNote = ` (автоматично обробляється збирачем сміття в JavaScript)`;
                            break;
                        case 'cpp':
                        default:
                            codeDef = `void remove_tail()`;
                            checkEmpty = `if (head == nullptr) {\n    std::cout << "List is empty. Nothing to remove." << std::endl;\n    return;\n}`;
                            singleCar = `if (head->next == head) {\n    delete head;\n    head = nullptr;\n    return;\n}`;
                            findPenultimate = `Node* temp = head;\nwhile (temp->next->next != head) {\n    temp = temp->next;\n}\nNode* tail_node = temp->next;`;
                            closeCircle = `temp->next = head;`;
                            clearMemory = `delete tail_node;`;
                            gcNote = ``;
                            break;
                    }
                    const clearMemoryHtml = clearMemory ? `<pre><code>${clearMemory}</code></pre>` : '';
                    return `<h3>Видалення елемента з кінця кільцевого списку (<code>remove_tail</code>)</h3>
<p>Видалення останнього елемента (Хвоста) у кільцевому списку — це завдання, яке вимагає від нас знайти "передостанній" вагон. Чому саме його? Тому що після того, як ми відчепимо останній вагон, саме передостанній має взяти на себе його роль і замкнути коло, з'єднавшись з найпершим вагоном (Головою).</p>
<h3>Покрокове пояснення коду:</h3>
<ul>
<li><pre><code>${codeDef}\n    ${checkEmpty}</code></pre><strong>Перевірка на порожнечу:</strong> Як завжди, алгоритм спочатку переконується, що потяг взагалі існує. Якщо Голова порожня, видаляти нічого, і функція просто завершує роботу.</li>
<li><pre><code>${singleCar}</code></pre><strong>Сценарій одного вагона:</strong> Якщо в списку лише один вагон, він замкнутий сам на себе. Видалення його кінця означає видалення всього потяга. Програма просто знищує цей єдиний вузол і залишає після нього порожнечу (Голова стає порожньою).</li>
<li><pre><code>${findPenultimate}</code></pre><strong>Пошук передостаннього вагона:</strong> Якщо потяг довгий, починається найцікавіше. Програма запускає курсор від Голови списку. Цей курсор постійно "дивиться на два кроки вперед". Він питає себе: "Чи є вагон, який йде через один від мене, нашою Головою?". Якщо ні, курсор робить крок вперед. Щойно відповідь стає "так", курсор зупиняється. Це означає, що він стоїть рівно на передостанньому вагоні.</li>
<li><pre><code>${closeCircle}</code></pre><strong>Замикання нового кола:</strong> Тепер у нас є доступ до передостаннього вагона, а відразу за ним стоїть наш старий Хвіст. Ми беремо "зчеплення" передостаннього вагона і направляємо його прямо на Голову списку, ігноруючи старий останній вагон. Коло знову замкнуте, але вже без Хвоста!</li>
<li>${clearMemoryHtml}<strong>Очищення пам'яті:</strong> Старий останній вагон тепер ізольований від нашого кільцевого потяга. Щоб він не займав зайве місце, програма остаточно знищує його, звільняючи оперативну пам'ять комп'ютера.${gcNote}</li>
</ul>
<h3>Часова складність:</h3>
<ul>
<li><strong>O(n) (Лінійний час):</strong> Швидкість виконання цієї операції прямо залежить від кількості вагонів. Оскільки ми можемо рухатися лише вперед, алгоритм змушений пройти майже весь потяг (від першого до передостаннього вагона), щоб безпечно відчепити кінець і замкнути коло. Тому для списку з n елементів йому доведеться зробити близько n кроків.<br><em>(Важливе зауваження: на відміну від операцій на початку списку, навіть якби ми підтримували постійний вказівник на Хвіст, це не прискорило б видалення. Щоб відчепити Хвіст, нам все одно потрібен доступ до передостаннього елемента, а рухатися назад ми не можемо. Ця операція швидка лише у двозв'язних списках).</em></li>
</ul>`;
                }

                let codeDef, checkEmpty, checkSingle, findPenultimate, detachTail, gcNote;
                switch (progLang) {
                    case 'python':
                        codeDef = `def remove_tail(self):`;
                        checkEmpty = `if not self.head: return`;
                        checkSingle = `if not self.head.next:\n    self.head = None\n    return`;
                        findPenultimate = `temp = self.head\nwhile temp.next.next:\n    temp = temp.next`;
                        detachTail = `temp.next = None`;
                        gcNote = `(В Python "від'єднаний" елемент пізніше автоматично видаляється з пам'яті комп'ютера збирачем сміття).`;
                        break;
                    case 'java':
                        codeDef = `void removeTail()`;
                        checkEmpty = `if(head == null) return;`;
                        checkSingle = `if(head.next == null) {\n    head = null;\n    return;\n}`;
                        findPenultimate = `Node temp = head;\nwhile(temp.next.next != null)\n    temp = temp.next;`;
                        detachTail = `temp.next = null;`;
                        gcNote = `(В Java "від'єднаний" елемент пізніше автоматично видаляється з пам'яті комп'ютера збирачем сміття).`;
                        break;
                    case 'javascript':
                        codeDef = `removeTail() {`;
                        checkEmpty = `if(!this.head) return;`;
                        checkSingle = `if(!this.head.next) {\n    this.head = null;\n    return;\n}`;
                        findPenultimate = `let temp = this.head;\nwhile(temp.next.next)\n    temp = temp.next;`;
                        detachTail = `temp.next = null;`;
                        gcNote = `(В JavaScript "від'єднаний" елемент пізніше автоматично видаляється з пам'яті комп'ютера збирачем сміття).`;
                        break;
                    case 'cpp':
                    default:
                        codeDef = `void removeTail()`;
                        checkEmpty = `if(!head) return;`;
                        checkSingle = `if(!head->next) {\n    delete head;\n    head = nullptr;\n    return;\n}`;
                        findPenultimate = `Node* temp = head;\nwhile(temp->next->next)\n    temp = temp->next;`;
                        detachTail = `delete temp->next;\ntemp->next = nullptr;`;
                        gcNote = ``;
                        break;
                }

                return `<h3>Видалення елемента з кінця (<code>removeTail</code>)</h3>
<p>На відміну від миттєвого видалення з початку, видалення останнього елемента в однозв'язному списку трохи складніше. Справа в тому, що кожен вузол знає лише про свого "наступника". Ми не можемо просто подивитися на останній елемент і запитати: "Хто йде перед тобою?". Тому нам доводиться йти з самого початку, щоб знайти передостанній вузол і від'єднати від нього кінець.</p>
<h3>Покрокове пояснення коду:</h3>
<ul>
<li><pre><code>${checkEmpty}</code></pre><strong>Перевірка на порожнечу:</strong> Перш за все, програма перевіряє, чи є в списку взагалі якісь елементи. Якщо Голова порожня, алгоритм просто завершує роботу — видаляти нічого.</li>
<li><pre><code>${checkSingle}</code></pre><strong>Перевірка на єдиний елемент:</strong> Далі ми дивимося, чи складається наш потяг лише з одного вагона. Якщо після Голови більше нічого немає (наступний елемент відсутній), ми просто видаляємо цю Голову. Список стає повністю порожнім.</li>
<li><pre><code>${findPenultimate}</code></pre><strong>Пошук передостаннього елемента:</strong> Якщо в списку два або більше елементів, починається найголовніша частина. Програма створює "тимчасовий вказівник-курсор" і починає рух від першого вузла. Алгоритм постійно "заглядає на два кроки вперед" і питає: "чи є у наступного елемента свій наступний?". Якщо так — курсор робить крок вперед. Рух зупиняється рівно на тому вузлі, за яким іде останній елемент.</li>
<li><pre><code>${detachTail}</code></pre><strong>Від'єднання Хвоста:</strong> Знайшовши передостанній вузол, ми просто "відрізаємо" його зв'язок, кажучи, що його вказівник тепер порожній. Таким чином, колишній останній елемент просто відпадає від ланцюга. ${gcNote}</li>
</ul>
<h3>Часова складність:</h3>
<ul>
<li><strong>O(n) (Лінійний час):</strong> Швидкість виконання цієї операції прямо залежить від кількості елементів у списку. Оскільки алгоритм змушений крокувати від першого до передостаннього вузла, для списку з n елементів йому доведеться зробити близько n кроків.</li>
<li><strong>Чому вказівник на Хвіст не допоможе?</strong> Навіть якщо ми постійно підтримуємо швидкий доступ до останнього елемента (вказівник <code>tail</code>), це не прискорить видалення в однозв'язному списку. Щоб від'єднати Хвіст, нам потрібно оновити вказівник того вузла, який іде перед ним. А оскільки ми не можемо рухатися назад, нам доведеться знову йти з самого початку. (Ця проблема вирішується в двозв'язних списках, де вагони зчеплені з обох боків).</li>
</ul>`;
            },
            'reverse': (progLang) => {
                if (currentStructure === 'circular-linked-list') {
                    let codeDef, checkNecessity, prep, reverseLoop, closeCircle, updateStatus;
                    switch (progLang) {
                        case 'python':
                            codeDef = `def reverse(self):`;
                            checkNecessity = `if self.head is None or self.head.next == self.head:\n    return`;
                            prep = `prev = None\ncurrent = self.head\nnext_node = None`;
                            reverseLoop = `while True:\n    next_node = current.next\n    current.next = prev\n    prev = current\n    current = next_node\n    if current == self.head:\n        break`;
                            closeCircle = `self.head.next = prev`;
                            updateStatus = `self.head = prev`;
                            break;
                        case 'java':
                            codeDef = `void reverse()`;
                            checkNecessity = `if (head == null || head.next == head) {\n    return;\n}`;
                            prep = `Node prev = null;\nNode current = head;\nNode next_node = null;`;
                            reverseLoop = `do {\n    next_node = current.next;\n    current.next = prev;\n    prev = current;\n    current = next_node;\n} while (current != head);`;
                            closeCircle = `head.next = prev;`;
                            updateStatus = `head = prev;`;
                            break;
                        case 'javascript':
                            codeDef = `reverse() {`;
                            checkNecessity = `if (this.head === null || this.head.next === this.head) {\n    return;\n}`;
                            prep = `let prev = null;\nlet current = this.head;\nlet next_node = null;`;
                            reverseLoop = `do {\n    next_node = current.next;\n    current.next = prev;\n    prev = current;\n    current = next_node;\n} while (current !== this.head);`;
                            closeCircle = `this.head.next = prev;`;
                            updateStatus = `this.head = prev;`;
                            break;
                        case 'cpp':
                        default:
                            codeDef = `void reverse()`;
                            checkNecessity = `if (head == nullptr || head->next == head) {\n    return;\n}`;
                            prep = `Node* prev = nullptr;\nNode* current = head;\nNode* next_node = nullptr;`;
                            reverseLoop = `do {\n    next_node = current->next;\n    current->next = prev;\n    prev = current;\n    current = next_node;\n} while (current != head);`;
                            closeCircle = `head->next = prev;`;
                            updateStatus = `head = prev;`;
                            break;
                    }
                    return `<h3>Обертання кільцевого списку (<code>reverse</code>)</h3>
<p>Обертання кільцевого списку — це завдання підвищеної складності (як задача з зірочкою). Уявіть, що наш потяг їде по замкнутому колу за годинниковою стрілкою. Наша мета — розвернути всі "зчеплення" між вагонами так, щоб потяг поїхав проти годинникової стрілки. При цьому ми повинні бути вкрай обережними, щоб не розірвати наше нескінченне коло!</p>
<p>Цей процес дуже схожий на обертання стандартного лінійного списку (ми також використовуємо три тимчасові вказівники: Попередній, Поточний та Наступний), але має один надзвичайно важливий фінальний крок — правильне замикання нового кола.</p>
<h3>Покрокове пояснення коду:</h3>
<ul>
<li><pre><code>${codeDef}\n    ${checkNecessity}</code></pre><strong>Перевірка необхідності:</strong> Спочатку програма дивиться, чи є сенс щось робити. Якщо потяга не існує, або в ньому лише один вагон (який замкнутий сам на себе), то й обертати нічого — список виглядає однаково в обох напрямках. Процес негайно завершується.</li>
<li><pre><code>${prep}</code></pre><strong>Підготовка команди вказівників:</strong> Якщо вагонів багато, програма створює вже знайому нам трійцю вказівників. Поточний (Current) стає на Голову списку (перший вагон), Попередній (Previous) спочатку порожній, а Наступний (Next) чекає своєї черги.</li>
<li><pre><code>${reverseLoop}</code></pre><strong>Обертання по колу:</strong> Програма запускає цикл, який йде від вагона до вагона. Для кожного вузла вона виконує три дії: "запам'ятовує" наступний вагон, щоб не збитися зі шляху; відчіплює поточний вагон і направляє його "зчеплення" назад, на Попередній вагон; і робить крок всією командою вказівників вперед. Цей процес триває, поки Поточний вказівник не пройде все коло і знову не натрапить на оригінальну Голову списку.</li>
<li><p><strong>Увага, розірване коло!</strong> Коли цикл завершується, всі зчеплення між вагонами успішно розвернуті. Але є одна проблема: наша стара Голова (яка тепер стала останнім вагоном) зараз вказує в нікуди, і коло розірване. У той же час, наш Попередній вказівник зараз стоїть на колишньому останньому вагоні, який має стати новим початком.</p></li>
<li><pre><code>${closeCircle}</code></pre><strong>Фінальне замикання (Магія кільця):</strong> Щоб знову утворити коло, ми повинні з'єднати новий кінець з новим початком. Програма бере стару Голову і направляє її вказівник на той вагон, де зараз стоїть Попередній вказівник. Коло відновлено!</li>
<li><pre><code>${updateStatus}</code></pre><strong>Оновлення статусу:</strong> Нарешті, ми офіційно вішаємо табличку "Голова потяга" на той самий вагон, де стоїть Попередній вказівник. Тепер наш список повністю обернений і знову є ідеально замкнутим кільцем.</li>
</ul>
<h3>Часова складність:</h3>
<ul>
<li><strong>O(n) (Лінійний час):</strong> Щоб змінити напрямок усіх вагонів, алгоритму достатньо пройти по колу рівно один раз. Він відвідує кожен вузол, змінює його вказівник і йде далі. Тому для списку з n елементів йому знадобиться зробити n кроків. Це дуже швидка та ефективна операція, яка до того ж не потребує створення нових вагонів — ми лише перепризначаємо існуючі зчеплення.</li>
</ul>`;
                }

                let codeDef, prep, saveFuture, changeDirection, stepForward, finish;
                switch (progLang) {
                    case 'python':
                        codeDef = `def reverse(self):`;
                        prep = `prev = None\ncurrent = self.head`;
                        saveFuture = `next_node = current.next`;
                        changeDirection = `current.next = prev`;
                        stepForward = `prev = current\ncurrent = next_node`;
                        finish = `self.head = prev`;
                        break;
                    case 'java':
                        codeDef = `void reverse()`;
                        prep = `Node prev = null;\nNode current = head;\nNode next = null;`;
                        saveFuture = `next = current.next;`;
                        changeDirection = `current.next = prev;`;
                        stepForward = `prev = current;\ncurrent = next;`;
                        finish = `head = prev;`;
                        break;
                    case 'javascript':
                        codeDef = `reverse() {`;
                        prep = `let prev = null;\nlet current = this.head;\nlet next = null;`;
                        saveFuture = `next = current.next;`;
                        changeDirection = `current.next = prev;`;
                        stepForward = `prev = current;\ncurrent = next;`;
                        finish = `this.head = prev;`;
                        break;
                    case 'cpp':
                    default:
                        codeDef = `Node* reverse(Node* head)`;
                        prep = `Node* prev = nullptr;\nNode* current = head;\nNode* next = nullptr;`;
                        saveFuture = `next = current->next;`;
                        changeDirection = `current->next = prev;`;
                        stepForward = `prev = current;\ncurrent = next;`;
                        finish = `return prev;`;
                        break;
                }

                return `<h3>Обертання списку (<code>reverse</code>)</h3>
<p>Обертання однозв'язного списку — одне з найпопулярніших класичних питань на співбесідах. Уявіть, що вам потрібно розвернути потяг так, щоб останній вагон став першим, а перший — останнім. Оскільки ми не можемо просто взяти вагони і поміняти їх місцями, нам потрібно змінити напрямок усіх "зчеплень" (вказівників) між ними.</p>
<h3>Покрокове пояснення коду:</h3>
<p>Найбільша складність полягає в тому, що коли ми від'єднуємо вказівник від наступного елемента і спрямовуємо його назад, ми втрачаємо зв'язок з рештою списку. Щоб уникнути цього, алгоритм одночасно використовує три тимчасові вказівники: Попередній (<code>prev</code>), Поточний (<code>current</code>) та Наступний (<code>next</code>).</p>
<ul>
<li><pre><code>${prep}</code></pre><strong>Підготовка:</strong> На початку процесу ми встановлюємо Поточний вказівник на Голову списку (перший елемент). Попередній вказівник спочатку порожній (оскільки перед першим елементом нічого немає), а Наступний вказівник ми використаємо трохи пізніше.</li>
<li><pre><code>${saveFuture}</code></pre><strong>Збереження майбутнього:</strong> Починається цикл перебору. Перш ніж розвернути вказівник поточного вузла назад, ми повинні зберегти доступ до решти списку. Тому ми "запам'ятовуємо" наступний елемент за допомогою Наступного вказівника.</li>
<li><pre><code>${changeDirection}</code></pre><strong>Зміна напрямку:</strong> Тепер діяти безпечно! Ми беремо вказівник нашого Поточного вузла і від'єднуємо його від майбутнього, спрямовуючи назад — до Попереднього вузла. (Для самого першого вузла цей зв'язок стає порожнім, що логічно, адже він стане новим Хвостом).</li>
<li><pre><code>${stepForward}</code></pre><strong>Крок вперед:</strong> Обертання одного вузла завершено. Тепер вся наша команда вказівників робить крок вперед: Попередній стає на місце Поточного вузла, а Поточний переходить на збережену позицію Наступного вузла.</li>
<li><pre><code>${finish}</code></pre><strong>Завершення:</strong> Цей процес (зберегти -> розвернути -> крок вперед) повторюється для кожного вузла. Цикл зупиняється, коли Поточний вказівник виходить за межі списку (стає порожнім). Саме в цей момент Попередній вказівник зупиниться на колишньому останньому елементі. Ми просто оголошуємо його новою Головою!</li>
</ul>
<h3>Часова складність:</h3>
<ul>
<li><strong>O(n) (Лінійний час):</strong> Щоб розвернути список, алгоритм повинен відвідати кожен вузол рівно один раз по черзі. Швидкість виконання безпосередньо залежить від кількості елементів: для списку з n елементів програма зробить n кроків. При цьому ми не створюємо нових копій списку, а лише перепризначаємо існуючі вказівники, що робить цю операцію надзвичайно ефективною з точки зору пам'яті.</li>
</ul>`;
            },
                        'print': (progLang) => {
                if (currentStructure === 'circular-linked-list') {
                    let codeDef, checkEmpty, specialStart, readingLoop, finish;
                    switch (progLang) {
                        case 'python':
                            codeDef = `def print_list(self):`;
                            checkEmpty = `if self.head is None:\n    print("List is empty.")\n    return`;
                            specialStart = `temp = self.head`;
                            readingLoop = `while True:\n    print(f"{temp.data} -> ", end="")\n    temp = temp.next\n    if temp == self.head:\n        break`;
                            finish = `print("(Back to Head)")`;
                            break;
                        case 'java':
                            codeDef = `void print()`;
                            checkEmpty = `if (head == null) {\n    System.out.println("List is empty.");\n    return;\n}`;
                            specialStart = `Node temp = head;`;
                            readingLoop = `do {\n    System.out.print(temp.data + " -> ");\n    temp = temp.next;\n} while (temp != head);`;
                            finish = `System.out.println("(Back to Head)");`;
                            break;
                        case 'javascript':
                            codeDef = `print() {`;
                            checkEmpty = `if (this.head === null) {\n    console.log("List is empty.");\n    return;\n}`;
                            specialStart = `let temp = this.head;\nlet str = "";`;
                            readingLoop = `do {\n    str += temp.data + " -> ";\n    temp = temp.next;\n} while (temp !== this.head);`;
                            finish = `console.log(str + "(Back to Head)");`;
                            break;
                        case 'cpp':
                        default:
                            codeDef = `void print()`;
                            checkEmpty = `if (head == nullptr) {\n    std::cout << "List is empty." << std::endl;\n    return;\n}`;
                            specialStart = `Node* temp = head;`;
                            readingLoop = `do {\n    std::cout << temp->data << " -> ";\n    temp = temp->next;\n} while (temp != head);`;
                            finish = `std::cout << "(Back to Head)" << std::endl;`;
                            break;
                    }
                    return `<h3>Виведення кільцевого списку на екран (<code>print</code>)</h3>
<p>Прочитати звичайний список дуже просто: ми йдемо від першого вагона і зупиняємось, коли впираємось у порожнечу (кінець потяга). Але в кільцевому списку кінця немає! Якщо ми просто скажемо програмі "йди вперед, поки не побачиш порожнечу", вона буде нескінченно бігати по колу, виводячи одні й ті самі дані знову і знову, поки комп'ютер не зависне.</p>
<p>Тому нам потрібен спеціальний, хитрий підхід: ми маємо запам'ятати, звідки почали, і зупинитися рівно тоді, коли повернемося на старт.</p>
<h3>Покрокове пояснення коду:</h3>
<ul>
<li><pre><code>${codeDef}\n    ${checkEmpty}</code></pre><strong>Перевірка на порожнечу:</strong> Спочатку алгоритм перевіряє, чи взагалі існує потяг. Якщо Голова порожня, програма просто повідомляє: "Список порожній", і завершує роботу.</li>
<li><pre><code>${specialStart}</code></pre><strong>Особливий старт (Хитрість алгоритму):</strong> Програма ставить курсор для читання на найперший вагон (Голову). Тут є нюанс: якби ми сказали програмі "рухайся, поки не опинишся на Голові", вона б навіть не почала працювати, бо вона вже стоїть на Голові! Тому алгоритм використовує правило "спочатку роби, потім перевіряй".</li>
<li><pre><code>${readingLoop}</code></pre><strong>Читання та крок:</strong> За цим правилом програма спочатку бере інформацію з поточного вагона і виводить її на екран (зазвичай малюючи стрілочку до наступного). Лише після того, як дані прочитані, курсор робить один крок вперед. <br><strong>Перевірка на фініш:</strong> Зробивши крок, програма питає: "Чи є вагон, на якому я зараз стою, нашою стартовою Головою?". Якщо ні, цикл повторюється (ми читаємо і крокуємо далі). <br><strong>Завершення кола:</strong> Як тільки курсор робить крок і розуміє, що знову опинився на найпершому вагоні, цикл миттєво зупиняється. Ми успішно пройшли повне коло!</li>
<li><pre><code>${finish}</code></pre><strong>Візуальний акцент:</strong> Щоб користувачу було зрозуміло, що це не звичайний лінійний список, а замкнуте кільце, в кінці програма виводить спеціальне повідомлення на кшталт "(Повернення до Голови)".</li>
</ul>
<h3>Часова складність:</h3>
<ul>
<li><strong>O(n) (Лінійний час):</strong> Швидкість читання прямо залежить від кількості вагонів у потязі. Щоб показати весь список, курсору потрібно зайти в кожен вагон рівно один раз і зробити рівно одне повне коло. Отже, для списку з n елементів програма зробить n кроків. Це оптимальний і єдиний можливий час для цієї задачі.</li>
</ul>`;
                }

                let codeDef, prep, loopStart, display, step, finish;
                switch (progLang) {
                    case 'python':
                        codeDef = `def print_list(self):`;
                        prep = `temp = self.head`;
                        loopStart = `while temp:`;
                        display = `print(temp.data, end=" -> ")`;
                        step = `temp = temp.next`;
                        finish = `print("None")`;
                        break;
                    case 'java':
                        codeDef = `void print()`;
                        prep = `Node temp = head;`;
                        loopStart = `while(temp != null) {`;
                        display = `System.out.print(temp.data + " -> ");`;
                        step = `temp = temp.next;\n}`;
                        finish = `System.out.println("null");`;
                        break;
                    case 'javascript':
                        codeDef = `print() {`;
                        prep = `let temp = this.head;\nlet str = "";`;
                        loopStart = `while(temp) {`;
                        display = `str += temp.data + " -> ";`;
                        step = `temp = temp.next;\n}`;
                        finish = `console.log(str + "null");`;
                        break;
                    case 'cpp':
                    default:
                        codeDef = `void print()`;
                        prep = `Node* temp = head;`;
                        loopStart = `while(temp) {`;
                        display = `cout << temp->data << " -> ";`;
                        step = `temp = temp->next;\n}`;
                        finish = `cout << "NULL\\n";`;
                        break;
                }

                return `<h3>Виведення списку на екран (<code>print</code>)</h3>
<p>Щоб побачити, які саме дані зараз зберігаються в нашому однозв'язному списку, нам потрібно пройти його від найпершого до останнього елемента. Оскільки у нас є прямий доступ лише до початку (Голови), процес нагадує читання книги: ми починаємо з першої сторінки і гортаємо їх одну за одною, поки не дійдемо до кінця.</p>
<h3>Покрокове пояснення коду:</h3>
<ul>
<li><pre><code>${prep}</code></pre><strong>Підготовка до читання:</strong> Спочатку програма створює "тимчасовий вказівник-курсор" і встановлює його на Голову списку (перший елемент). Це наша стартова точка.</li>
<li><pre><code>${loopStart}</code></pre><strong>Початок циклу:</strong> Далі запускається цикл перевірки. Алгоритм постійно запитує: "Чи вказує наш курсор зараз на реальний, існуючий вузол?". Якщо так, ми заходимо в цикл.</li>
<li><pre><code>${display}</code></pre><strong>Виведення даних:</strong> Перебуваючи на конкретному вузлі, програма бере корисну інформацію (дані), що в ньому зберігається, і виводить її на екран (зазвичай додаючи візуальну стрілочку "-&gt;", щоб показати зв'язок).</li>
<li><pre><code>${step}</code></pre><strong>Крок вперед:</strong> Після виведення даних курсор робить крок вперед — він переміщується на той вузол, на який вказує поточний елемент.</li>
<li><pre><code>${finish}</code></pre><strong>Завершення:</strong> Цей процес (прочитати дані -&gt; крок вперед) повторюється доти, поки курсор не вийде за межі останнього вузла і не стане порожнім (<code>NULL</code>). Коли це стається, цикл зупиняється, і програма просто виводить на екран слово "NULL", сигналізуючи про те, що ланцюжок закінчився.</li>
</ul>
<h3>Часова складність:</h3>
<ul>
<li><strong>O(n) (Лінійний час):</strong> Швидкість виконання цієї операції прямо пропорційна кількості елементів у списку. Щоб показати всі дані, програма змушена відвідати абсолютно кожен вузол рівно один раз. Відповідно, для списку з n елементів їй доведеться зробити n кроків і n разів вивести інформацію на екран.</li>
</ul>`;
            },
                        'sort': (progLang, algo) => {
                if (currentStructure === 'circular-linked-list') {
                    if (algo === 'Bubble Sort') {
                        let checkEmpty, startPass, compare, shorten, finishSort;
                        switch (progLang) {
                            case 'python':
                                checkEmpty = `if self.head is None or self.head.next == self.head:\n    return`;
                                startPass = `last_sorted = None\nswapped = True\nwhile swapped:\n    swapped = False\n    current = self.head`;
                                compare = `while current.next != last_sorted and current.next != self.head:\n    if current.data > current.next.data:\n        current.data, current.next.data = current.next.data, current.data\n        swapped = True\n    current = current.next`;
                                shorten = `last_sorted = current`;
                                finishSort = `# loop ends automatically when swapped == False`;
                                break;
                            case 'java':
                                checkEmpty = `if (head == null || head.next == head) {\n    return;\n}`;
                                startPass = `boolean swapped;\nNode current;\nNode last_sorted = null;\ndo {\n    swapped = false;\n    current = head;`;
                                compare = `while (current.next != last_sorted && current.next != head) {\n    if (current.data > current.next.data) {\n        int temp = current.data;\n        current.data = current.next.data;\n        current.next.data = temp;\n        swapped = true;\n    }\n    current = current.next;\n}`;
                                shorten = `last_sorted = current;`;
                                finishSort = `} while (swapped);`;
                                break;
                            case 'javascript':
                                checkEmpty = `if (this.head === null || this.head.next === this.head) {\n    return;\n}`;
                                startPass = `let swapped;\nlet current;\nlet last_sorted = null;\ndo {\n    swapped = false;\n    current = this.head;`;
                                compare = `while (current.next !== last_sorted && current.next !== this.head) {\n    if (current.data > current.next.data) {\n        let temp = current.data;\n        current.data = current.next.data;\n        current.next.data = temp;\n        swapped = true;\n    }\n    current = current.next;\n}`;
                                shorten = `last_sorted = current;`;
                                finishSort = `} while (swapped);`;
                                break;
                            case 'cpp':
                            default:
                                checkEmpty = `if (head == nullptr || head->next == head) {\n    return;\n}`;
                                startPass = `bool swapped;\nNode* current;\nNode* last_sorted = nullptr;\ndo {\n    swapped = false;\n    current = head;`;
                                compare = `while (current->next != last_sorted && current->next != head) {\n    if (current->data > current->next->data) {\n        std::swap(current->data, current->next->data);\n        swapped = true;\n    }\n    current = current->next;\n}`;
                                shorten = `last_sorted = current;`;
                                finishSort = `} while (swapped);`;
                                break;
                        }
                        return `<h3>Сортування кільцевого списку (Bubble Sort)</h3>
<p>Ви вже знайомі з алгоритмом "сортування бульбашкою", де найбільші значення поступово "спливають" у кінець списку. Для кільцевого списку базовий принцип залишається тим самим: ми не розриваємо зчеплення між вагонами, а просто міняємо їхній вантаж (дані) місцями.</p>
<p>Однак, оскільки наш потяг їде по замкнутому колу, виникає нова небезпека — алгоритм може нескінченно бігати по колу і ніколи не зупинитися! Тому нам потрібен надійний "запобіжник", який вчасно скаже: "Стоп, коло завершено".</p>
<h3>Покрокове пояснення коду:</h3>
<ul>
<li><pre><code>${checkEmpty}</code></pre><strong>Перевірка "чи є що сортувати":</strong> Якщо потяга не існує або в ньому лише один вагон, програма відразу завершує свою роботу. Такий список апріорі вважається відсортованим.</li>
<li><pre><code>${startPass}</code></pre><strong>Підготовка до кола:</strong> Алгоритм створює курсор і ставить його на Голову. Також він бере спеціальний індикатор (прапорець), який буде фіксувати, чи робили ми якісь перестановки вантажу під час поточного кола.</li>
<li><pre><code>${compare}</code></pre><strong>Рух і порівняння:</strong> Курсор починає рух. Він дивиться на вантаж у своєму вагоні та в наступному. Якщо його вантаж важчий (число більше), він міняє їхні дані місцями і вмикає прапорець. Після цього робить крок вперед. <br><strong>Запобіжник нескінченності:</strong> У звичайному списку курсор зупинився б, коли побачив порожнечу (кінець). Тут він зупиняється, коли бачить, що наступний вагон — це знову наша Голова! Це означає, що ми пройшли повне коло і більше перевіряти нічого.</li>
<li><pre><code>${shorten}</code></pre><strong>Розумна оптимізація (Скорочення шляху):</strong> Після найпершого повного кола найважчий вантаж гарантовано опиниться в самому останньому вагоні (прямо перед Головою). Щоб не робити зайвої роботи, алгоритм запам'ятовує цей вагон і ставить там умовний "знак стоп". Під час другого кола курсор вже не піде до самої Голови, а зупиниться перед цим знаком. З кожним колом цей "знак стоп" буде зсуватися ближче до початку, зменшуючи маршрут.</li>
<li><pre><code>${finishSort}</code></pre><strong>Ідеальний порядок:</strong> Програма знову і знову відправляє курсор на нові кола, поки він не проїде весь доступний маршрут, жодного разу не ввімкнувши прапорець (тобто не зробивши жодної перестановки). Це означає, що весь вантаж розставлено ідеально!</li>
</ul>
<h3>Часова складність:</h3>
<ul>
<li><strong>O(n²) (Квадратичний час) у найгіршому та середньому випадках:</strong> Навіть з нашою "розумною оптимізацією", якщо вантаж повністю перемішаний, алгоритму доведеться зробити дуже багато кіл. Для кільця з великою кількістю вагонів це забирає багато часу, тому бульбашкове сортування залишається повільним для великих обсягів даних.</li>
<li><strong>O(n) у найкращому випадку:</strong> Якщо ви дасте програмі потяг, де вантаж вже розставлений за зростанням, алгоритм зробить рівно одне коло, побачить, що нічого міняти не треба, і миттєво завершить роботу.</li>
</ul>`;
                    } else if (algo === 'Selection Sort') {
                        let checkEmpty, outerLoop, innerLoop, swapData, moveOuter;
                        switch (progLang) {
                            case 'python':
                                checkEmpty = `if self.head is None or self.head.next == self.head:\n    return`;
                                outerLoop = `current = self.head\nwhile True:\n    min_node = current\n    temp = current.next`;
                                innerLoop = `    while temp != self.head:\n        if temp.data < min_node.data:\n            min_node = temp\n        temp = temp.next`;
                                swapData = `    if min_node != current:\n        current.data, min_node.data = min_node.data, current.data`;
                                moveOuter = `    current = current.next\n    if current.next == self.head:\n        break`;
                                break;
                            case 'java':
                                checkEmpty = `if (head == null || head.next == head) {\n    return;\n}`;
                                outerLoop = `Node current = head;\ndo {\n    Node min_node = current;\n    Node temp = current.next;`;
                                innerLoop = `    while (temp != head) {\n        if (temp.data < min_node.data) {\n            min_node = temp;\n        }\n        temp = temp.next;\n    }`;
                                swapData = `    if (min_node != current) {\n        int tmp = current.data;\n        current.data = min_node.data;\n        min_node.data = tmp;\n    }`;
                                moveOuter = `    current = current.next;\n} while (current.next != head);`;
                                break;
                            case 'javascript':
                                checkEmpty = `if (this.head === null || this.head.next === this.head) {\n    return;\n}`;
                                outerLoop = `let current = this.head;\ndo {\n    let min_node = current;\n    let temp = current.next;`;
                                innerLoop = `    while (temp !== this.head) {\n        if (temp.data < min_node.data) {\n            min_node = temp;\n        }\n        temp = temp.next;\n    }`;
                                swapData = `    if (min_node !== current) {\n        let tmp = current.data;\n        current.data = min_node.data;\n        min_node.data = tmp;\n    }`;
                                moveOuter = `    current = current.next;\n} while (current.next !== this.head);`;
                                break;
                            case 'cpp':
                            default:
                                checkEmpty = `if (head == nullptr || head->next == head) {\n    return;\n}`;
                                outerLoop = `Node* current = head;\ndo {\n    Node* min_node = current;\n    Node* temp = current->next;`;
                                innerLoop = `    while (temp != head) {\n        if (temp->data < min_node->data) {\n            min_node = temp;\n        }\n        temp = temp->next;\n    }`;
                                swapData = `    if (min_node != current) {\n        std::swap(current->data, min_node->data);\n    }`;
                                moveOuter = `    current = current->next;\n} while (current->next != head);`;
                                break;
                        }
                        return `<h3>Сортування вибором у кільцевому списку (Selection Sort)</h3>
<p>Алгоритм "сортування вибором" працює як дуже прискіпливий вантажник. Його мета — знайти найменший (найлегший) вантаж і покласти його в перший вагон, потім знайти наступний найменший і покласти в другий, і так далі.</p>
<p>Для кільцевого списку ми використовуємо підхід "обміну даними": ми не розчіплюємо самі вагони, а просто переносимо коробки з числами з одного вагона в інший. Головна складність тут — вчасно зупинити пошук, щоб не піти на друге коло по нашому нескінченному кільцю.</p>
<h3>Покрокове пояснення коду:</h3>
<ul>
<li><pre><code>${checkEmpty}</code></pre><strong>Перевірка готовності:</strong> Перш за все, програма дивиться, чи є сенс починати роботу. Якщо потяга не існує або в ньому лише один вагон, сортувати нічого — список за замовчуванням вважається ідеальним.</li>
<li><pre><code>${outerLoop}</code></pre><strong>Вибір "цільового" вагона:</strong> Алгоритм ставить головний курсор на перший вагон (Голову). Цей курсор позначає вагон, який ми зараз намагаємося заповнити найменшим доступним вантажем. Програма тимчасово припускає, що вантаж, який вже лежить у цьому вагоні, і є найменшим.</li>
<li><pre><code>${innerLoop}</code></pre><strong>Запуск розвідника (Пошук мінімуму):</strong> Далі алгоритм відправляє вперед курсор-розвідник. Його завдання — пробігтися по всіх наступних вагонах і перевірити їхній вантаж. <br><strong>Запобіжник нескінченності:</strong> Оскільки потяг кільцевий, розвідник повинен знати, де зупинитися. Він біжить вперед і порівнює вантажі, поки не побачить, що наступний вагон — це знову наша стартова Голова. Це сигнал, що повне коло (невідсортованої частини) пройдено. Якщо під час пробіжки розвідник знаходить вантаж, менший за наш "тимчасовий мінімум", він просто запам'ятовує розташування цього вагона.</li>
<li><pre><code>${swapData}</code></pre><strong>Обмін вантажем:</strong> Коли розвідник завершує своє коло, ми точно знаємо, де лежить найменший вантаж. Якщо виявилося, що він не в нашому "цільовому" вагоні, програма просто міняє їхні вантажі місцями.</li>
<li><pre><code>${moveOuter}</code></pre><strong>Крок вперед:</strong> Тепер перший вагон має ідеальний вантаж і вважається відсортованим! Головний курсор переходить до другого вагона, і весь процес пошуку повторюється. Алгоритм зупиняє свою роботу за один крок до Голови (на передостанньому вагоні) — бо якщо всі попередні вагони відсортовані правильно, в останньому автоматично залишиться найбільший вантаж.</li>
</ul>
<h3>Часова складність:</h3>
<ul>
<li><strong>O(n²) (Квадратичний час) у всіх випадках:</strong> На відміну від "бульбашкового" сортування, сортування вибором не вміє розуміти, чи список вже впорядковано. Навіть якщо всі вантажі ідеально розставлені від найменшого до найбільшого, наш розвідник все одно буде старанно бігати по колу на кожному кроці, щоб перевірити кожен вагон. Тому для потяга з n вагонів він завжди робитиме приблизно n × n кроків. Через це алгоритм вважається повільним для великих обсягів даних.</li>
</ul>`;
                    } else if (algo === 'Insertion Sort') {
                        let checkEmpty, disassemble, build, stepForward, finishUp;
                        switch (progLang) {
                            case 'python':
                                checkEmpty = `if self.head is None or self.head.next == self.head:\n    return`;
                                disassemble = `sorted_head = None\ncurrent = self.head`;
                                build = `    sorted_head = self.sortedInsert(sorted_head, current)`;
                                stepForward = `    current = next_node\n    if current == self.head:\n        break`;
                                finishUp = `self.head = sorted_head`;
                                break;
                            case 'java':
                                checkEmpty = `if (head == null || head.next == head) {\n    return;\n}`;
                                disassemble = `Node sorted_head = null;\nNode current = head;`;
                                build = `    sorted_head = sortedInsert(sorted_head, current);`;
                                stepForward = `    current = next_node;\n} while (current != head);`;
                                finishUp = `head = sorted_head;`;
                                break;
                            case 'javascript':
                                checkEmpty = `if (this.head === null || this.head.next === this.head) {\n    return;\n}`;
                                disassemble = `let sorted_head = null;\nlet current = this.head;`;
                                build = `    sorted_head = this.sortedInsert(sorted_head, current);`;
                                stepForward = `    current = next_node;\n} while (current !== this.head);`;
                                finishUp = `this.head = sorted_head;`;
                                break;
                            case 'cpp':
                            default:
                                checkEmpty = `if (head == nullptr || head->next == head) {\n    return;\n}`;
                                disassemble = `Node* sorted_head = nullptr;\nNode* current = head;`;
                                build = `    sorted_head = sortedInsert(sorted_head, current);`;
                                stepForward = `    current = next_node;\n} while (current != head);`;
                                finishUp = `head = sorted_head;`;
                                break;
                        }
                        return `<h3>Сортування вставкою у кільцевому списку (Insertion Sort)</h3>
<p>Алгоритм "сортування вставкою" нагадує процес, коли ви берете по одній карті з невідсортованої колоди і вставляєте її в правильне місце у віялі карт у вашій руці.</p>
<p>У випадку з кільцевим списком, ми буквально крок за кроком розбираємо наш старий, невідсортований потяг і паралельно будуємо з його вагонів новий — відразу відсортований. Тут ми не просто міняємо вантаж; ми реально перечіплюємо самі вагони, слідкуючи за тим, щоб новий потяг завжди залишався замкнутим у кільце!</p>
<h3>Покрокове пояснення коду:</h3>
<ul>
<li><pre><code>${checkEmpty}</code></pre><strong>Перевірка готовності:</strong> Якщо потяг порожній або складається лише з одного вагона (який замкнутий сам на собі), програма нічого не робить. Такий список вже вважається ідеальним.</li>
<li><pre><code>${disassemble}</code></pre><strong>Розбирання старого потяга:</strong> Програма створює порожню платформу для нашого майбутнього, "відсортованого" потяга. Потім вона підходить до першого вагона старого потяга. Важливий момент: перш ніж відчепити цей вагон, програма обов'язково повинна "запам'ятати", який вагон йде наступним, щоб не загубити залишок старого потяга в процесі розбирання.</li>
<li><pre><code>${build}</code></pre><strong>Будівництво нового потяга (Пошук місця):</strong> Відчепивши вагон, алгоритм дивиться на наш новий потяг, щоб знайти для нього правильне місце:<br>
<strong>Сценарій А (Новий потяг порожній):</strong> Якщо це найперший відчеплений вагон, він стає Головою нового потяга і відразу причіплюється сам до себе (утворюючи міні-кільце).<br>
<strong>Сценарій Б (Найлегший вантаж):</strong> Якщо вантаж у нашому вагоні менший, ніж у Голови нового потяга, він має стати новим початком. Але оскільки це кільце, програма змушена пробігтися аж до Хвоста нового потяга, щоб відчепити його від старої Голови і перечепити до нашого нового вагона.<br>
<strong>Сценарій В (Вантаж посередині або важчий):</strong> Якщо вагон має стати десь посередині або в кінці, спеціальний курсор пробігає по новому потягу, шукаючи "щілину", де наступний вагон буде важчим за наш. Знайшовши її, він акуратно розсуває зчеплення і вставляє наш вагон туди.</li>
<li><pre><code>${stepForward}</code></pre><strong>Крок вперед:</strong> Як тільки вагон успішно причеплено до нового потяга, програма повертається до того "запам'ятованого" вагона зі старого потяга (крок 2) і повторює процес.</li>
<li><pre><code>${finishUp}</code></pre><strong>Завершення:</strong> Цей цикл "відчепити -&gt; знайти місце -&gt; вставити в кільце" триває, поки старий потяг не буде повністю розібрано. В кінці ми оголошуємо наш новозбудований, ідеально відсортований потяг головним!</li>
</ul>
<h3>Часова складність:</h3>
<ul>
<li><strong>O(n²) (Квадратичний час):</strong> Оскільки ми працюємо з кільцем, цей алгоритм багато бігає туди-сюди. Для кожного відчепленого вагона програма повинна знайти місце в новому потязі, перебираючи його з початку. А якщо вагон виявляється найменшим (Сценарій Б), їй доведеться пробігти аж до кінця нового потяга, щоб перечепити Хвіст. Для довгих списків цей процес забирає чимало часу.</li>
<li><strong>Перевага:</strong> Попри повільність на великих обсягах даних, цей метод працює чудово і дуже швидко, якщо список вже майже відсортований з самого початку, або якщо вагонів зовсім мало.</li>
</ul>`;
                    } else if (algo === 'Quick Sort') {
                        let findTail, choosePivot, partitionLoop, fixPivot, divideConquer, oneWayMovement;
                        switch (progLang) {
                            case 'python':
                                findTail = `def get_tail(self):\n    if self.head is None:\n        return None\n    temp = self.head\n    while temp.next != self.head:\n        temp = temp.next\n    return temp`;
                                choosePivot = `pivot = end.data\ni = start\nj = start`;
                                partitionLoop = `while j != end:\n    if j.data < pivot:\n        i.data, j.data = j.data, i.data\n        i = i.next\n    j = j.next`;
                                fixPivot = `i.data, end.data = end.data, i.data\nreturn i`;
                                divideConquer = `if start != pivot_node:\n    temp = start\n    # ...\n    self._quick_sort(start, temp)\nif pivot_node != end:\n    self._quick_sort(pivot_node.next, end)`;
                                oneWayMovement = `temp = start\nwhile temp.next != pivot_node:\n    temp = temp.next`;
                                break;
                            case 'java':
                                findTail = `Node get_tail() {\n    if (head == null) return null;\n    Node temp = head;\n    while (temp.next != head) {\n        temp = temp.next;\n    }\n    return temp;\n}`;
                                choosePivot = `int pivot = end.data;\nNode i = start;`;
                                partitionLoop = `for (Node j = start; j != end; j = j.next) {\n    if (j.data < pivot) {\n        int temp = i.data;\n        i.data = j.data;\n        j.data = temp;\n        i = i.next;\n    }\n}`;
                                fixPivot = `int temp = i.data;\ni.data = end.data;\nend.data = temp;\nreturn i;`;
                                divideConquer = `if (start != pivot_node) {\n    Node temp = start;\n    // ...\n    _quick_sort(start, temp);\n}\nif (pivot_node != end) {\n    _quick_sort(pivot_node.next, end);\n}`;
                                oneWayMovement = `Node temp = start;\nwhile (temp.next != pivot_node) {\n    temp = temp.next;\n}`;
                                break;
                            case 'javascript':
                                findTail = `get_tail() {\n    if (this.head === null) return null;\n    let temp = this.head;\n    while (temp.next !== this.head) {\n        temp = temp.next;\n    }\n    return temp;\n}`;
                                choosePivot = `let pivot = end.data;\nlet i = start;`;
                                partitionLoop = `for (let j = start; j !== end; j = j.next) {\n    if (j.data < pivot) {\n        let temp = i.data;\n        i.data = j.data;\n        j.data = temp;\n        i = i.next;\n    }\n}`;
                                fixPivot = `let temp = i.data;\ni.data = end.data;\nend.data = temp;\nreturn i;`;
                                divideConquer = `if (start !== pivot_node) {\n    let temp = start;\n    // ...\n    this._quick_sort(start, temp);\n}\nif (pivot_node !== end) {\n    this._quick_sort(pivot_node.next, end);\n}`;
                                oneWayMovement = `let temp = start;\nwhile (temp.next !== pivot_node) {\n    temp = temp.next;\n}`;
                                break;
                            case 'cpp':
                            default:
                                findTail = `Node* get_tail() {\n    if (head == nullptr) return nullptr;\n    Node* temp = head;\n    while (temp->next != head) {\n        temp = temp->next;\n    }\n    return temp;\n}`;
                                choosePivot = `int pivot = end->data;\nNode* i = start;`;
                                partitionLoop = `for (Node* j = start; j != end; j = j->next) {\n    if (j->data < pivot) {\n        std::swap(i->data, j->data);\n        i = i->next;\n    }\n}`;
                                fixPivot = `std::swap(i->data, end->data);\nreturn i;`;
                                divideConquer = `if (start != pivot_node) {\n    Node* temp = start;\n    // ...\n    _quick_sort(start, temp);\n}\nif (pivot_node != end) {\n    _quick_sort(pivot_node->next, end);\n}`;
                                oneWayMovement = `Node* temp = start;\nwhile (temp->next != pivot_node) {\n    temp = temp->next;\n}`;
                                break;
                        }
                        return `<h3>Швидке сортування у кільцевому списку (Quick Sort)</h3>
<p>"Швидке сортування" — один з найпотужніших алгоритмів. Його головна ідея полягає в тому, щоб вибрати один "еталонний" (опорний) вантаж і розкидати інші так, щоб усі легші вантажі опинилися зліва від нього, а важчі — справа.</p>
<p>Сортування кільцевого списку цим методом досить цікаве. Оскільки потяг замкнутий у нескінченне коло, алгоритму спочатку потрібно "подумки" його розірвати, визначивши чіткі межі: де наш тимчасовий "початок" і "кінець". Важливо зазначити: у цій версії алгоритму ми не розчіплюємо самі вагони (щоб не розірвати кільце), а лише переносимо коробки з числами з одного вагона в інший (обмін значеннями).</p>
<h3>Покрокове пояснення коду:</h3>
<ul>
<li><pre><code>${findTail}</code></pre><strong>Пошук меж (Визначення Хвоста):</strong> Перш за все, програма перевіряє, чи існує потяг. Якщо в ньому більше одного вагона, алгоритм відправляє курсор по колу, щоб знайти самісінький останній вагон (Хвіст), який причеплений до Голови. Тепер у нас є чітка робоча зона: від Голови до Хвоста.</li>
<li><pre><code>${choosePivot}</code></pre><strong>Вибір "Еталона" (Опорного елемента):</strong> Алгоритм бере вантаж із самого останнього вагона нашої робочої зони і призначає його "еталоном".</li>
<li><pre><code>${partitionLoop}</code></pre><strong>Розбиття (Сортування за групами):</strong> Запускається курсор-розвідник, починаючи з першого вагона. Його мета — знайти всі вантажі, які легші за наш еталон. Як тільки розвідник знаходить такий легкий вантаж, він пересуває його ближче до початку потяга (міняє місцями з іншими вантажами).</li>
<li><pre><code>${fixPivot}</code></pre><strong>Фіксація Еталона:</strong> Коли розвідник перевірить усі вагони, ми будемо точно знати, де закінчується група "легких" вантажів. Програма бере наш "еталонний" вантаж з останнього вагона і ставить його рівно на цю межу. Відтепер цей вантаж стоїть на своєму ідеальному, фінальному місці!</li>
<li><pre><code>${divideConquer}</code></pre><strong>Розділяй і володарюй (Рекурсія):</strong> Тепер наш потяг логічно поділено на дві невідсортовані частини: вагони зліва від еталона та вагони справа. Алгоритм бере ліву частину і повторює для неї всі ті самі кроки (знову шукає кінець цієї зони, вибирає новий еталон, ділить вантажі). Потім він робить те саме для правої частини.</li>
<li><pre><code>${oneWayMovement}</code></pre><strong>Складність одностороннього руху:</strong> Щоб відсортувати ліву групу, алгоритм має знати, де вона закінчується (тобто знайти вагон, що передує нашому зафіксованому еталону). Оскільки потяг може їхати тільки вперед, програмі доводиться щоразу робити додатковий пробіг від початку лівої групи, щоб знайти цей передостанній вагон.</li>
</ul>
<h3>Часова складність:</h3>
<ul>
<li><strong>O(n log n) у найкращому та середньому випадках:</strong> Якщо еталонний вантаж щоразу ділить зону приблизно на дві рівні половини, алгоритм працює надзвичайно ефективно. Він впорядковує дані блискавично, повністю виправдовуючи свою назву "Швидке" (Quick).</li>
<li><strong>O(n²) у найгіршому випадку:</strong> Це слабке місце алгоритму. Якщо дати йому потяг, де вантажі вже розставлені ідеально (або навпаки, у зворотному порядку), самісінький останній вагон завжди матиме найбільший (або найменший) вантаж. Через це розбиття буде жахливим: 0 вагонів з одного боку і всі інші — з іншого. У такому сценарії, плюс враховуючи необхідність постійно бігати вперед для пошуку меж, швидкість алгоритму сильно падає і він стає таким же повільним, як "бульбашкове сортування".</li>
</ul>`;
                    }
                }

                if (algo === 'Bubble Sort') {
                    let codeDef, checkEmpty, startPass, compare, shorten, finishSort;
                    switch (progLang) {
                        case 'python':
                            checkEmpty = `if not self.head: return`;
                            startPass = `swapped = True\nwhile swapped:\n    swapped = False\n    current = self.head`;
                            compare = `if current.data > current.next.data:\n    current.data, current.next.data = current.next.data, current.data\n    swapped = True\ncurrent = current.next`;
                            shorten = ``;
                            finishSort = `# loop ends automatically when swapped == False`;
                            break;
                        case 'java':
                            checkEmpty = `if(head == null) return;`;
                            startPass = `boolean swapped;\nNode current;\ndo {\n    swapped = false;\n    current = head;`;
                            compare = `if (current.data > current.next.data) {\n    int t = current.data; current.data = current.next.data; current.next.data = t;\n    swapped = true;\n}\ncurrent = current.next;`;
                            shorten = ``;
                            finishSort = `} while (swapped);`;
                            break;
                        case 'javascript':
                            checkEmpty = `if(!this.head) return;`;
                            startPass = `let swapped;\ndo {\n    swapped = false;\n    let current = this.head;`;
                            compare = `if (current.data > current.next.data) {\n    let t = current.data; current.data = current.next.data; current.next.data = t;\n    swapped = true;\n}\ncurrent = current.next;`;
                            shorten = ``;
                            finishSort = `} while (swapped);`;
                            break;
                        case 'cpp':
                        default:
                            checkEmpty = `if(!head) return;`;
                            startPass = `bool swapped;\nNode* ptr1;\nNode* lptr = nullptr;\ndo {\n    swapped = false;\n    ptr1 = head;`;
                            compare = `if (ptr1->data > ptr1->next->data) {\n    swap(ptr1->data, ptr1->next->data);\n    swapped = true;\n}\nptr1 = ptr1->next;`;
                            shorten = `lptr = ptr1;`;
                            finishSort = `} while (swapped);`;
                            break;
                    }

                    const shortenHtml = shorten ? `<pre><code>${shorten}</code></pre>` : `<em>(Примітка: Ця оптимізація показана в коді C++, але для простоти пропущена в цьому фрагменті)</em><br>`;

                    return `<h3>Сортування списку (Bubble Sort)</h3>
<p>Алгоритм "сортування бульбашкою" — один з найпростіших способів впорядкувати елементи від найменшого до найбільшого. Свою назву він отримав через те, що під час його роботи найбільші значення поступово "спливають" у кінець списку, немов бульбашки повітря у воді.</p>
<p>Цікава особливість цього алгоритму саме для зв'язних списків полягає в тому, що ми не розриваємо зв'язки і не переставляємо самі вузли (вагони). Ми робимо простіше: ми просто обмінюємося інформацією (вантажем) всередині цих вузлів.</p>
<h3>Покрокове пояснення коду:</h3>
<ul>
<li><pre><code>${checkEmpty}</code></pre><strong>Перевірка на порожнечу:</strong> Перш за все, алгоритм перевіряє, чи не порожній наш список. Якщо сортувати нічого, операція відразу ж завершується.</li>
<li><pre><code>${startPass}</code></pre><strong>Початок проходів:</strong> Програма починає рух з початку списку. Для контролю процесу створюється спеціальний прапорець (індикатор), який спочатку вимкнений. Він буде фіксувати, чи міняли ми щось місцями під час поточного проходу.</li>
<li><pre><code>${compare}</code></pre><strong>Порівняння сусідів:</strong> Курсор стає на перший вузол і порівнює його значення з тим, що лежить у наступному вузлі. Якщо поточне значення більше за наступне (порядок порушено), програма міняє їхні дані місцями і вмикає наш прапорець. Потім курсор робить крок вперед і порівнює наступну пару.</li>
<li>${shortenHtml}<strong>Скорочення шляху (оптимізація):</strong> Після кожного повного проходу від початку до кінця найбільше число гарантовано опиняється на самій останній позиції. Щоб не робити зайвої роботи, алгоритм запам'ятовує цю фінальну позицію. Під час наступного проходу він вже не буде перевіряти кінець списку, зупиняючись на один крок раніше.</li>
<li><pre><code>${finishSort}</code></pre><strong>Завершення сортування:</strong> Проходи від початку до невідсортованої частини повторюються знову і знову. Алгоритм повністю зупиняє свою роботу лише тоді, коли під час чергового проходу прапорець залишився вимкненим. Це означає, що жодних перестановок не відбулося, а отже — список ідеально відсортовано!</li>
</ul>
<h3>Часова складність:</h3>
<ul>
<li><strong>O(n²) у найгіршому та середньому випадках:</strong> Якщо список перемішаний або відсортований у зворотному порядку, алгоритму доведеться зробити безліч проходів. Для списку з великою кількістю елементів кількість операцій зростає дуже стрімко (квадратично). Тому цей метод вважається повільним для великих обсягів даних.</li>
<li><strong>O(n) у найкращому випадку:</strong> Завдяки нашому прапорцю, якщо ми передамо алгоритму вже повністю відсортований список, він зробить лише один-єдиний прохід, переконається, що міняти нічого не потрібно, і миттєво завершить свою роботу.</li>
</ul>`;
                } else if (algo === 'Insertion Sort') {
                    let checkEmpty, newPlatform, detachCar, findPlace, stepFwd, finishUp;
                    switch (progLang) {
                        case 'python':
                            checkEmpty = `if not self.head or not self.head.next: return`;
                            newPlatform = `sorted_head = None\ncurrent = self.head`;
                            detachCar = `nxt = current.next`;
                            findPlace = `if not sorted_head or sorted_head.data >= current.data:\n    current.next = sorted_head\n    sorted_head = current\nelse:\n    temp = sorted_head\n    while temp.next and temp.next.data < current.data:\n        temp = temp.next\n    current.next = temp.next\n    temp.next = current`;
                            stepFwd = `current = nxt`;
                            finishUp = `self.head = sorted_head`;
                            break;
                        case 'java':
                            checkEmpty = `if (head == null || head.next == null) return;`;
                            newPlatform = `Node sorted = null;\nNode current = head;`;
                            detachCar = `Node next = current.next;`;
                            findPlace = `if (sorted == null || sorted.data >= current.data) {\n    current.next = sorted;\n    sorted = current;\n} else {\n    Node temp = sorted;\n    while (temp.next != null && temp.next.data < current.data) temp = temp.next;\n    current.next = temp.next;\n    temp.next = current;\n}`;
                            stepFwd = `current = next;`;
                            finishUp = `head = sorted;`;
                            break;
                        case 'javascript':
                            checkEmpty = `if (!this.head || !this.head.next) return;`;
                            newPlatform = `let sorted = null;\nlet current = this.head;`;
                            detachCar = `let next = current.next;`;
                            findPlace = `if (!sorted || sorted.data >= current.data) {\n    current.next = sorted;\n    sorted = current;\n} else {\n    let temp = sorted;\n    while (temp.next && temp.next.data < current.data) temp = temp.next;\n    current.next = temp.next;\n    temp.next = current;\n}`;
                            stepFwd = `current = next;`;
                            finishUp = `this.head = sorted;`;
                            break;
                        case 'cpp':
                        default:
                            checkEmpty = `if (!head || !head->next) return;`;
                            newPlatform = `Node* sorted = nullptr;\nNode* current = head;`;
                            detachCar = `Node* next = current->next;`;
                            findPlace = `if (sorted == nullptr || sorted->data >= current->data) {\n    current->next = sorted;\n    sorted = current;\n} else {\n    Node* temp = sorted;\n    while (temp->next != nullptr && temp->next->data < current->data) temp = temp->next;\n    current->next = temp->next;\n    temp->next = current;\n}`;
                            stepFwd = `current = next;`;
                            finishUp = `head = sorted;`;
                            break;
                    }

                    return `<h3>Сортування списку (Insertion Sort)</h3>
<p>Алгоритм "сортування вставкою" працює точно так само, як більшість людей сортують карти в руках під час гри. Ви берете по одній карті з невідсортованої колоди і вставляєте її в правильне місце серед тих карт, які ви вже впорядкували.</p>
<p>У випадку зі зв'язним списком ми буквально "розбираємо" наш старий потяг вагон за вагоном і будуємо з них новий — відразу повністю відсортований. Зверніть увагу: на відміну від попередніх алгоритмів, де ми просто міняли вантаж між вагонами, тут ми реально перечіпляємо самі вагони (міняємо вказівники).</p>
<h3>Покрокове пояснення коду:</h3>
<ul>
<li><pre><code>${checkEmpty}</code></pre><strong>Перевірка на порожнечу:</strong> Як і завжди, спершу перевіряємо, чи є взагалі що сортувати. Якщо список порожній або має лише один елемент, алгоритм миттєво завершує свою роботу — такий список вважається вже відсортованим!</li>
<li><pre><code>${newPlatform}</code></pre><strong>Створення нової платформи:</strong> Алгоритм створює порожній вказівник для нового, "відсортованого" списку. Спочатку в ньому нічого немає. Ми також ставимо наш головний курсор на перший вагон початкового списку.</li>
<li><pre><code>${detachCar}</code></pre><strong>Від'єднання вагона:</strong> Ми фокусуємося на поточному вагоні, але перед тим як його відчепити, ми обов'язково маємо "запам'ятати", який вагон іде після нього. Це вкрай важливо, щоб не загубити решту потяга, коли ми розірвемо зв'язки.</li>
<li><pre><code>${findPlace}</code></pre><strong>Пошук правильного місця:</strong> Тепер ми дивимося на наш новий, "відсортований" список і шукаємо, куди саме вставити цей відчеплений вагон:<br>
- Якщо новий список ще порожній, або якщо наш вагон має менше значення, ніж самий перший вагон нового списку — ми просто ставимо його в самий початок. Він стає Головою відсортованого списку.<br>
- Якщо ж ні, ми запускаємо тимчасовий пошуковий курсор, який біжить по новому списку від початку і шукає місце, де наступний вагон буде більшим за наш. Знайшовши такий "проміжок", ми акуратно розсовуємо вагони і вставляємо наш рівно туди.</li>
<li><pre><code>${stepFwd}</code></pre><strong>Крок вперед:</strong> Після того, як вагон успішно прилаштовано на своє місце, наш головний курсор повертається на той наступний вагон зі старого потяга, який ми запам'ятали на кроці 3.</li>
<li><pre><code>${finishUp}</code></pre><strong>Завершення:</strong> Цей процес (відчепити -&gt; знайти місце -&gt; вставити) повторюється, поки вагони у старому списку не закінчаться. Наприкінці ми просто вішаємо табличку "Голова" на початок нашого нового, ідеально відсортованого потяга.</li>
</ul>
<h3>Часова складність:</h3>
<ul>
<li><strong>O(n²) (Квадратичний час) у найгіршому та середньому випадках:</strong> Якщо список відсортований у зворотному порядку, для кожної вставки алгоритму доведеться проходити весь вже відсортований ланцюжок від початку до кінця, щоб знайти правильне місце. Для великої кількості елементів це займає багато часу.</li>
<li><strong>O(n) у найкращому випадку:</strong> У цього алгоритму є одна суперсила — він працює блискавично швидко, якщо список вже майже відсортований або має дуже малу кількість елементів.</li>
</ul>`;
                } else if (algo === 'Selection Sort') {
                    let codeDef, divZones, assumeMin, scout, swapData, stepFwd;
                    switch (progLang) {
                        case 'python':
                            divZones = `temp = self.head\nwhile temp:`;
                            assumeMin = `min_node = temp`;
                            scout = `r = temp.next\nwhile r:\n    if min_node.data > r.data: min_node = r\n    r = r.next`;
                            swapData = `temp.data, min_node.data = min_node.data, temp.data`;
                            stepFwd = `temp = temp.next`;
                            break;
                        case 'java':
                            divZones = `Node temp = head;\nwhile (temp != null) {`;
                            assumeMin = `Node min = temp;`;
                            scout = `Node r = temp.next;\nwhile (r != null) {\n    if (min.data > r.data) min = r;\n    r = r.next;\n}`;
                            swapData = `int x = temp.data; temp.data = min.data; min.data = x;`;
                            stepFwd = `temp = temp.next;\n}`;
                            break;
                        case 'javascript':
                            divZones = `let temp = this.head;\nwhile (temp) {`;
                            assumeMin = `let min = temp;`;
                            scout = `let r = temp.next;\nwhile (r) {\n    if (min.data > r.data) min = r;\n    r = r.next;\n}`;
                            swapData = `let x = temp.data; temp.data = min.data; min.data = x;`;
                            stepFwd = `temp = temp.next;\n}`;
                            break;
                        case 'cpp':
                        default:
                            divZones = `Node* temp = head;\nwhile (temp) {`;
                            assumeMin = `Node* min = temp;`;
                            scout = `Node* r = temp->next;\nwhile (r) {\n    if (min->data > r->data) min = r;\n    r = r->next;\n}`;
                            swapData = `swap(temp->data, min->data);`;
                            stepFwd = `temp = temp->next;\n}`;
                            break;
                    }

                    return `<h3>Сортування списку (Selection Sort)</h3>
<p>Алгоритм "сортування вибором" працює за дуже життєвим принципом. Уявіть, що перед вами розкладено ряд карток з числами. Ви скануєте очима найменше число, забираєте його і кладете на найперше місце. Потім шукаєте найменше серед тих, що залишилися, і кладете на друге місце. І так далі, поки всі картки не будуть по порядку.</p>
<p>Як і в попередньому алгоритмі сортування, ми не розриваємо зв'язки між вузлами (не переставляємо самі вагони). Ми просто обмінюємося інформацією (корисним вантажем) всередині них.</p>
<h3>Покрокове пояснення коду:</h3>
<ul>
<li><pre><code>${divZones}</code></pre><strong>Поділ на зони:</strong> Алгоритм умовно ділить наш список на дві частини: "вже відсортовано" і "ще не відсортовано". Спочатку відсортована частина порожня. Програма встановлює головний вказівник (курсор) на самий початок списку.</li>
<li><pre><code>${assumeMin}</code></pre><strong>Припущення мінімуму:</strong> Перебуваючи на поточному вузлі, алгоритм тимчасово припускає, що саме тут лежить найменше значення. Він запам'ятовує цей вузол як "мінімум".</li>
<li><pre><code>${scout}</code></pre><strong>Пошук справжнього мінімуму (розвідка):</strong> Далі програма відправляє вперед другий вказівник-"розвідник". Цей розвідник пробігає від наступного вузла до самого кінця списку. Його завдання — порівняти кожне число з нашим "тимчасовим мінімумом". Якщо розвідник знаходить ще менше число, програма оновлює інформацію і запам'ятовує нове місцезнаходження найменшого елемента.</li>
<li><pre><code>${swapData}</code></pre><strong>Обмін даними:</strong> Коли розвідник добігає кінця списку, ми точно знаємо, де лежить найменше значення у цій невідсортованій частині. Тепер програма просто міняє місцями дані між поточним вузлом (де стоїть наш головний курсор) та знайденим мінімальним вузлом.</li>
<li><pre><code>${stepFwd}</code></pre><strong>Крок вперед:</strong> Найменший елемент успішно розміщено на своєму правильному місці! Тепер головний курсор робить один крок вперед (відсортована зона збільшується), і весь процес пошуку мінімуму повторюється для решти списку. Алгоритм зупиняється, коли курсор досягає кінця.</li>
</ul>
<h3>Часова складність:</h3>
<ul>
<li><strong>O(n²) (Квадратичний час) у всіх випадках:</strong> На відміну від "бульбашкового" сортування, сортування вибором не вміє розпізнавати, чи відсортовано список заздалегідь. Навіть якщо ви передасте йому ідеально впорядкований потяг, розвідник все одно на кожному кроці буде сумлінно бігати до кінця списку, щоб абсолютно точно переконатися, що меншого числа немає. Тому для списку з n елементів воно завжди виконує приблизно n * n кроків. Цей алгоритм також є неефективним для великих списків.</li>
</ul>`;
                } else if (algo === 'Quick Sort') {
                    let choosePivot, partitioning, fixPivot, recursion;
                    switch (progLang) {
                        case 'python':
                            choosePivot = `pivot = head\ncurr = head.next\nprev = head`;
                            partitioning = `while curr != tail.next:\n    if curr.data < pivot.data:\n        prev.next.data, curr.data = curr.data, prev.next.data\n        prev = prev.next\n    curr = curr.next`;
                            fixPivot = `pivot.data, prev.data = prev.data, pivot.data\nreturn prev`;
                            recursion = `if not head or head == tail: return\npivot = partition(head, tail)\nif pivot != head:\n    temp = head\n    while temp.next != pivot: temp = temp.next\n    quick_sort_rec(head, temp)\nquick_sort_rec(pivot.next, tail)`;
                            break;
                        case 'java':
                            choosePivot = `Node pivot = head;\nNode curr = head.next;\nNode prev = head;`;
                            partitioning = `while (curr != tail.next) {\n    if (curr.data < pivot.data) {\n        int temp = prev.next.data; prev.next.data = curr.data; curr.data = temp;\n        prev = prev.next;\n    }\n    curr = curr.next;\n}`;
                            fixPivot = `int temp = pivot.data; pivot.data = prev.data; prev.data = temp;\nreturn prev;`;
                            recursion = `if (head == null || head == tail) return;\nNode pivot = partition(head, tail);\nif (pivot != head) {\n    Node temp = head;\n    while (temp.next != pivot) temp = temp.next;\n    quickSortRec(head, temp);\n}\nquickSortRec(pivot.next, tail);`;
                            break;
                        case 'javascript':
                            choosePivot = `let pivot = head;\nlet curr = head.next;\nlet prev = head;`;
                            partitioning = `while (curr !== tail.next) {\n    if (curr.data < pivot.data) {\n        let temp = prev.next.data; prev.next.data = curr.data; curr.data = temp;\n        prev = prev.next;\n    }\n    curr = curr.next;\n}`;
                            fixPivot = `let temp = pivot.data; pivot.data = prev.data; prev.data = temp;\nreturn prev;`;
                            recursion = `if (!head || head === tail) return;\nlet pivot = this.partition(head, tail);\nif (pivot !== head) {\n    let temp = head;\n    while (temp.next !== pivot) temp = temp.next;\n    this.quickSortRec(head, temp);\n}\nthis.quickSortRec(pivot.next, tail);`;
                            break;
                        case 'cpp':
                        default:
                            choosePivot = `Node* pivot = head;\nNode* curr = head->next;\nNode* prev = head;`;
                            partitioning = `while (curr != tail->next) {\n    if (curr->data < pivot->data) {\n        swap(prev->next->data, curr->data);\n        prev = prev->next;\n    }\n    curr = curr->next;\n}`;
                            fixPivot = `swap(pivot->data, prev->data);\nreturn prev;`;
                            recursion = `if (!head || head == tail) return;\nNode* pivot = partition(head, tail);\nif (pivot != head) {\n    Node* temp = head;\n    while (temp->next != pivot) temp = temp->next;\n    quickSortRec(head, temp);\n}\nquickSortRec(pivot->next, tail);`;
                            break;
                    }

                    return `<h3>Сортування списку (Quick Sort)</h3>
<p>Алгоритм "швидкого сортування" вважається одним із найпотужніших та найефективніших методів впорядкування даних. Уявіть, що вам потрібно вишикувати групу людей за зростом. Замість того, щоб порівнювати кожного з кожним, ви навмання вибираєте одну людину і кажете: "Всі, хто нижчий за неї — станьте ліворуч, а всі, хто вищий — праворуч". Далі ви робите те саме окремо для лівої та правої груп. Саме так працює цей алгоритм!</p>
<p>У наведеному варіанті сортування для однозв'язного списку ми використовуємо підхід "обміну значень" (value swapping). Це означає, що ми не розриваємо зв'язки між вагонами нашого потяга, а просто переміщуємо вантаж (дані) з одного вагона в інший, щоб згрупувати їх правильно.</p>
<h3>Покрокове пояснення коду:</h3>
<ul>
<li><pre><code>${choosePivot}</code></pre><strong>Вибір "Опорного" (Pivot) елемента:</strong> Спершу алгоритм обирає один вагон, вантаж якого стає нашим еталоном (найчастіше це просто найперший елемент у списку або його поточній частині). Саме це число ми будемо використовувати для порівняння.</li>
<li><pre><code>${partitioning}</code></pre><strong>Розподіл (Partitioning):</strong> Далі запускається спеціальний вказівник-розвідник, який перевіряє всі інші вагони. Його мета — знайти всі числа, які менші за наш опорний еталон. Щойно він знаходить таке маленьке число, він міняє його дані місцями з вантажем, що лежить ближче до початку потяга. Таким чином, усі "легкі" вантажі поступово збиваються в одну групу зліва.</li>
<li><pre><code>${fixPivot}</code></pre><strong>Фіксація опорного елемента:</strong> Коли розвідник перевірить усі вагони, ми будемо точно знати, де закінчується група "менших" чисел і починається група "більших". Саме на цю межу алгоритм і переміщує наше початкове опорне число. Відтепер це число стоїть на своєму ідеальному, остаточному місці! Воно більше нікуди не зрушить.</li>
<li><pre><code>${recursion}</code></pre><strong>Повторення (Рекурсія):</strong> Тепер наш потяг візуально поділено на дві невідсортовані частини: вагони зліва від зафіксованого числа і вагони справа. Програма бере ліву частину і повторює для неї всі кроки знову (обирає нове опорне число, ділить на менші/більші). Потім робить те саме для правої частини. Цей процес повторюється доти, поки не залишаться "групи" з одного вагона, які вважаються вже відсортованими.</li>
</ul>
<h3>Особлиність для однозв'язних списків:</h3>
<p>Оскільки в однозв'язному списку ми можемо рухатися лише вперед, алгоритму доводиться кожного разу робити додатковий прохід від початку списку, щоб знайти той вагон, який стоїть безпосередньо перед нашим зафіксованим опорним елементом (щоб зрозуміти, де закінчується ліва частина). Тому це сортування тут реалізувати трохи складніше, ніж у стандартних масивах або двозв'язних списках.</p>
<h3>Часова складність:</h3>
<ul>
<li><strong>O(n log n) у найкращому та середньому випадках:</strong> Якщо опорний елемент щоразу ділить список приблизно на дві рівні половини, алгоритм працює надзвичайно ефективно. Він виправдовує свою назву і сортує дані дуже швидко, навіть якщо їх мільйони.</li>
<li><strong>O(n²) у найгіршому випадку:</strong> Це "ахіллесова п'ята" швидкого сортування. Якщо підсунути йому вже відсортований список (або відсортований у зворотному порядку), найперший елемент завжди буде найменшим або найбільшим. Список поділиться дуже нерівномірно: один вагон з одного боку, і всі інші — з іншого. В такому разі швидкість алгоритму сильно падає і він стає таким же повільним, як "бульбашкове сортування".</li>
</ul>`;
                }
                return `Сортує список використовуючи ${algo || 'обраний алгоритм'}.`;
            },
            'add_vertex': (progLang) => {
                if (currentStructure === 'undirected-graph') {
                    let appendEmpty, incCounter, notifyOpen;
                    switch (progLang) {
                        case 'python':
                            appendEmpty = `self.adj.append([])`;
                            incCounter = `self.numVertices += 1`;
                            notifyOpen = `print(f"Added vertex {self.numVertices - 1}")`;
                            break;
                        case 'java':
                            appendEmpty = `adj.add(new ArrayList<Integer>());`;
                            incCounter = `numVertices++;`;
                            notifyOpen = `System.out.println("Added vertex " + (numVertices - 1));`;
                            break;
                        case 'javascript':
                            appendEmpty = `this.adj.push([]);`;
                            incCounter = `this.numVertices++;`;
                            notifyOpen = `console.log(\`Added vertex \${this.numVertices - 1}\\n\`);`;
                            break;
                        case 'cpp':
                        default:
                            appendEmpty = `adj.push_back(std::vector<int>());`;
                            incCounter = `numVertices++;`;
                            notifyOpen = `std::cout << "Added vertex " << numVertices - 1 << std::endl;`;
                            break;
                    }
                    return `<h3>Додавання вершини до графа (add_vertex)</h3>
<p><strong>Аналогія з реального життя: Будівництво нової залізничної станції</strong></p>
<p>Уявіть, що ми розширюємо транспортну мережу країни. Ми вже маємо певну кількість міст, з'єднаних коліями. Цей алгоритм діє як наказ побудувати абсолютно нову станцію десь у полі.</p>
<p>Ось етапи цього "будівництва":</p>
<ul>
<li><pre><code>${appendEmpty}</code></pre><strong>Розчищення пустиря (Додавання списку):</strong> Алгоритм створює новий, абсолютно порожній запис у головній маршрутній книзі. Це означає: "Станція вже існує, але до неї ще не прокладено жодної колії". Нова вершина додається ізольовано, без будь-яких з'єднань з іншими.</li>
<li><pre><code>${incCounter}</code></pre><strong>Оновлення статистики (Збільшення лічильника):</strong> Ми беремо загальний реєстр усіх станцій у мережі та збільшуємо їх загальну кількість на одиницю. Тепер система офіційно знає, що кількість об'єктів зросла.</li>
<li><pre><code>${notifyOpen}</code></pre><strong>Офіційне відкриття (Виведення повідомлення):</strong> Диспетчерам надсилається сповіщення: "Увага, успішно додано нову станцію з таким-то номером" (у програмуванні нумерація зазвичай починається з нуля, тому номер нової станції на одиницю менший за загальну кількість).</li>
</ul>
<p>Після виконання цього алгоритму в нашій мережі з'являється нова точка, яка терпляче чекає на інший алгоритм (додавання ребра), щоб прокласти до неї маршрути.</p>
<h3>Оцінка ефективності (Big O)</h3>
<p><strong>Часова складність:</strong> O(1) (амортизована)<br>
Додавання нового порожнього запису в кінець динамічного масиву (списку суміжності) зазвичай відбувається миттєво. Нам не потрібно перевіряти або переміщати існуючі станції; ми просто додаємо нову в кінець списку.</p>
<p><strong>Просторова складність:</strong> O(1)<br>
Алгоритм виділяє мінімальний обсяг пам'яті виключно для одного нового порожнього списку з'єднань. Масштаб самого графа жодним чином не впливає на ці витрати.</p>`;
                } else if (currentStructure.includes('graph')) {
                    let checkExist, addSuccess;
                    switch (progLang) {
                        case 'python':
                            checkExist = `if vertex not in self.adj_list:`;
                            addSuccess = `self.adj_list[vertex] = []`;
                            break;
                        case 'java':
                            checkExist = `if (!adj_list.containsKey(vertex)) {`;
                            addSuccess = `adj_list.put(vertex, new ArrayList<Integer>());`;
                            break;
                        case 'javascript':
                            checkExist = `if (!this.adj_list.has(vertex)) {`;
                            addSuccess = `this.adj_list.set(vertex, []);`;
                            break;
                        case 'cpp':
                        default:
                            checkExist = `if (adj_list.find(vertex) == adj_list.end()) {`;
                            addSuccess = `adj_list[vertex] = std::vector<int>();`;
                            break;
                    }
                    return `<h3>Додавання вершини до графа (add_vertex)</h3>
<p>Ми переходимо до надзвичайно потужної структури даних — Графів. Якщо зв'язний список нагадував потяг із послідовних вагонів, то граф найкраще уявляти як карту міст (які в програмуванні називаються "вершинами" або вузлами), з'єднаних дорогами (які називаються "ребрами").<br>
Функція <code>add_vertex</code> виконує найпершу і найпростішу дію — вона просто реєструє нове місто на нашій порожній або вже існуючій карті.</p>
<h3>Покрокове пояснення:</h3>
<ul>
<li><pre><code>${checkExist}</code></pre><strong>Перевірка довідника (Пошук дублікатів):</strong> Перш ніж будувати нове місто, програма заглядає у свій головний довідник (так званий "список суміжності"), щоб перевірити, чи немає там вже міста з точно такою ж назвою або ідентифікаційним номером.</li>
<li><pre><code>${addSuccess}</code></pre><strong>Реєстрація нового міста:</strong> Якщо перевірка показує, що такого міста ще немає, програма офіційно додає його до довідника. На цьому етапі місто створюється абсолютно ізольованим — до нього ще не ведуть жодні дороги, і з нього неможливо нікуди виїхати (для нього створюється порожній список зв'язків). Дороги (ребра) ми будемо будувати пізніше за допомогою інших функцій.</li>
<li><strong>Захист від помилок:</strong> Якщо місто з таким номером вже є на карті, алгоритм нічого не перезаписує і просто повідомляє користувача, що така точка вже існує. Це дуже важливий захисний механізм. Якби ми дозволили створення двох міст з однаковими номерами, наша навігаційна система просто б зламалася, не розуміючи, куди саме прокладати маршрути.</li>
</ul>
<h3>Часова складність:</h3>
<ul>
<li><strong>O(1) або O(log V) (Дуже швидко):</strong> Швидкість додавання вершини залежить від того, як саме технічно влаштований наш "довідник" під капотом програми:
<ul>
<li>Якщо довідник працює за принципом миттєвого пошуку (хеш-таблиця), перевірка та створення нового запису відбуваються за ідеальний константний час — O(1).</li>
<li>Якщо довідник побудований як впорядковане дерево пошуку, програмі знадобиться трохи часу, щоб знайти потрібне місце за алфавітом або номером. У такому разі швидкість складе O(log V), де V — це кількість вже існуючих вершин (міст).</li>
</ul>
</li>
</ul>
<p>В обох випадках це надзвичайно ефективна операція, яка виконується майже миттєво.</p>`;
                }
                return `Додає нову вершину до графа. Часова складність: O(1).`;
            },
            'add_edge': (progLang) => {
                if (currentStructure === 'undirected-graph') {
                    let safetyCheck, firstConn, secondConn;
                    switch (progLang) {
                        case 'python':
                            safetyCheck = `if u >= self.numVertices or v >= self.numVertices or u < 0 or v < 0:\n    print("Error: One or both vertices do not exist!")\n    return`;
                            firstConn = `self.adj[u].append(v)`;
                            secondConn = `self.adj[v].append(u)`;
                            break;
                        case 'java':
                            safetyCheck = `if (u >= numVertices || v >= numVertices || u < 0 || v < 0) {\n    System.out.println("Error: One or both vertices do not exist!");\n    return;\n}`;
                            firstConn = `adj.get(u).add(v);`;
                            secondConn = `adj.get(v).add(u);`;
                            break;
                        case 'javascript':
                            safetyCheck = `if (u >= this.numVertices || v >= this.numVertices || u < 0 || v < 0) {\n    console.log("Error: One or both vertices do not exist!\\n");\n    return;\n}`;
                            firstConn = `this.adj[u].push(v);`;
                            secondConn = `this.adj[v].push(u);`;
                            break;
                        case 'cpp':
                        default:
                            safetyCheck = `if (u >= numVertices || v >= numVertices || u < 0 || v < 0) {\n    std::cout << "Error: One or both vertices do not exist!" << std::endl;\n    return;\n}`;
                            firstConn = `adj[u].push_back(v);`;
                            secondConn = `adj[v].push_back(u);`;
                            break;
                    }
                    return `<h3>Додавання з'єднання / ребра (add_edge)</h3>
<p><strong>Аналогія з реального життя: Прокладання двоколійної залізниці між містами</strong></p>
<p>Якщо в попередньому прикладі ми будували ізольовані станції, то тепер ми виділяємо ресурси, щоб з'єднати дві з них повноцінною колією. Оскільки граф неорієнтований, це схоже на будівництво стандартної двоколійної залізниці, де поїзди можуть вільно курсувати в обох напрямках.</p>
<p>Ось як покроково працює логіка цього процесу:</p>
<ul>
<li><pre><code>${safetyCheck}</code></pre><strong>Перевірка реальності (Перевірка безпеки):</strong> Перш ніж відправляти будівельну бригаду, головний інженер завжди звіряється з картою. Він перевіряє, чи дійсно існують обидві вказані станції в реальності (їх номери не можуть бути від'ємними або більшими за загальну кількість існуючих станцій). Якщо хтось дає наказ з'єднати існуючу станцію з якоюсь уявною зупинкою "№ 999", система негайно блокує цю дію і повідомляє про помилку. Не можна будувати колії в нікуди.</li>
<li><pre><code>${firstConn}</code></pre><strong>Оновлення розкладу першої станції (З'єднання u &rarr; v):</strong> Якщо обидві станції існують, ми повідомляємо начальнику першої станції: "Тепер у вас є прямий маршрут до другої станції". Він додає цей напрямок до свого місцевого списку доступних рейсів.</li>
<li><pre><code>${secondConn}</code></pre><strong>Дзеркальне оновлення (З'єднання v &rarr; u):</strong> Оскільки наша залізниця працює у двох напрямках, ми обов'язково повинні зателефонувати начальнику другої станції і дати аналогічну вказівку: "Додайте зворотний рейс до першої станції у свій розклад".</li>
</ul>
<p>Без цього останнього кроку ми отримали б орієнтований граф (вулицю з одностороннім рухом), але для двостороннього зв'язку критично важливо записати інформацію в журнали обох вузлів.</p>
<h3>Оцінка ефективності (Big O)</h3>
<p><strong>Часова складність:</strong> O(1) (амортизована)<br>
Перевірка існування станцій — це миттєва математична операція. Саме "прокладання маршруту" полягає у швидкому додаванні одного запису в кінець списків для двох конкретних станцій. Час виконання не залежить від того, наскільки масивною є вся транспортна мережа.</p>
<p><strong>Просторова складність:</strong> O(1)<br>
Для запису нового з'єднання алгоритм використовує рівно два нових елементи пам'яті (по одному для кожного напрямку). Масштаб усього графа не впливає на ці витрати.</p>`;
                } else if (currentStructure.includes('graph')) {
                    let prepVertex, linkEdge;
                    switch (progLang) {
                        case 'python':
                            prepVertex = `self.add_vertex(source)\nself.add_vertex(destination)`;
                            linkEdge = `self.adj_list[source].append(destination)`;
                            break;
                        case 'java':
                            prepVertex = `add_vertex(source);\nadd_vertex(destination);`;
                            linkEdge = `adj_list.get(source).add(destination);`;
                            break;
                        case 'javascript':
                            prepVertex = `this.add_vertex(source);\nthis.add_vertex(destination);`;
                            linkEdge = `this.adj_list.get(source).push(destination);`;
                            break;
                        case 'cpp':
                        default:
                            prepVertex = `add_vertex(source);\nadd_vertex(destination);`;
                            linkEdge = `adj_list[source].push_back(destination);`;
                            break;
                    }
                    return `<h3>Додавання з'єднання / ребра (add_edge)</h3>
<p>Якщо вершини — це міста на нашій карті, то ребра — це дороги, які їх з'єднують. Без доріг наш граф складався б просто з набору ізольованих точок, між якими неможливо подорожувати.</p>
<p>Функція, яку ми розглядаємо, створює орієнтоване ребро. У реальному житті це точний еквівалент вулиці з одностороннім рухом. Тобто ми прокладаємо маршрут від Міста А до Міста Б, але це зовсім не означає, що по цій самій дорозі можна повернутися назад!</p>
<h3>Покрокове пояснення:</h3>
<ul>
<li><pre><code>${prepVertex}</code></pre><strong>Перевірка існування міст:</strong> Перш ніж будувати дорогу, логічно переконатися, що обидва міста дійсно існують. Алгоритм бере початкову та кінцеву точки і перевіряє наш головний довідник. Якщо якогось із цих міст ще немає на карті, програма автоматично створює їх (за допомогою попередньої функції <code>add_vertex</code>). Це захищає систему від помилок: ми ніколи не побудуємо дорогу "в нікуди".</li>
<li><pre><code>${linkEdge}</code></pre><strong>Встановлення вказівника (Прокладання дороги):</strong> Як тільки ми переконалися, що обидва міста є на карті, алгоритм заглядає в довідник початкового міста. Він додає місто призначення до списку доступних виїздів з цього початкового міста.</li>
<li><strong>Одностороння природа:</strong> Зверніть увагу: програма записує маршрут лише в довідник початкового міста. У довіднику міста призначення жодних нових записів не з'являється. Саме тому дорога виходить односторонньою. (Якби ми хотіли зробити стандартне двостороннє шосе, програмі довелося б зробити ще один крок і записати зворотний маршрут).</li>
</ul>
<h3>Часова складність:</h3>
<ul>
<li><strong>O(1) (Дуже швидко):</strong> Сам процес додавання нового запису про дорогу до списку виїздів міста відбувається майже миттєво. Загальний час виконання залежить лише від того, наскільки швидко програма знаходить ці міста в довіднику (як ми з'ясували раніше, це займає час O(1) або O(log V)). У будь-якому випадку, швидкість прокладання нової дороги не залежить від того, скільки мільйонів інших доріг вже існує на нашій карті. Це надзвичайно ефективна операція!</li>
</ul>`;
                }
                return `Додає орієнтоване або неорієнтоване ребро між двома вершинами. Часова складність: O(1) (для списків суміжності).`;
            },
            'bfs': (progLang) => {
                if (currentStructure === 'undirected-graph') {
                    let setupQueue, markVisited, addToQueue;
                    switch (progLang) {
                        case 'python':
                            setupQueue = `visited = [False] * self.numVertices\nq = []`;
                            markVisited = `visited[neighbor] = True`;
                            addToQueue = `q.append(neighbor)`;
                            break;
                        case 'java':
                            setupQueue = `boolean[] visited = new boolean[numVertices];\nQueue<Integer> q = new LinkedList<>();`;
                            markVisited = `visited[neighbor] = true;`;
                            addToQueue = `q.add(neighbor);`;
                            break;
                        case 'javascript':
                            setupQueue = `const visited = new Array(this.numVertices).fill(false);\nconst q = [];`;
                            markVisited = `visited[neighbor] = true;`;
                            addToQueue = `q.push(neighbor);`;
                            break;
                        case 'cpp':
                        default:
                            setupQueue = `std::vector<bool> visited(numVertices, false);\nstd::queue<int> q;`;
                            markVisited = `visited[neighbor] = true;`;
                            addToQueue = `q.push(neighbor);`;
                            break;
                    }
                    return `<h3>Пошук в ширину (BFS)</h3>
<p><strong>Аналогія з реального життя: Масштабна рятувальна операція</strong></p>
<p>Уявіть, що в місті загубився собака, і ви керуєте штабом пошукової операції. Ваше завдання &mdash; прочесати місцевість так, щоб жоден провулок не залишився без уваги, поступово розширюючи зону пошуку навколо точки, де востаннє бачили улюбленця.</p>
<p>Ось як працює ваша стратегія (вона повністю відображає логіку BFS):</p>
<ul>
<li><pre><code>${setupQueue}</code></pre><strong>Організація штабу (Початковий вузол і черга):</strong> Ви ставите намет на перехресті, з якого починається пошук (<code>startNode</code>). Щоб уникнути хаосу, ви берете рупор і блокнот (в алгоритмі це черга). У цей блокнот ви будете записувати всі перехрестя, які потрібно перевірити, строго в порядку їхньої черги.</li>
<li><pre><code>${markVisited}</code></pre><strong>Перевірка найближчих сусідів (Перше коло):</strong> Спочатку ви відправляєте рятувальників на всі сусідні перехрестя (за один квартал). Коли рятувальники прибувають на місце, вони ставлять мітку "перевірено".</li>
<li><pre><code>${addToQueue}</code></pre><strong>Планування наступної хвилі (Додавання до черги):</strong> З кожного перевіреного сусіднього перехрестя рятувальники бачать нові вулиці, що ведуть ще далі. Вони передають їх координати вам по рації. Ви не кажете їм бігти туди негайно! Ви просто записуєте ці нові координати в кінець свого блокнота.</li>
<li><strong>Ефект кіл на воді:</strong> Ви продовжуєте викликати команди строго за списком з блокнота. Завдяки цьому правилу штаб гарантовано спочатку перевірить усі точки на відстані 1 кварталу, потім &mdash; усі точки на відстані 2 кварталів, потім &mdash; 3 кварталів і так далі. Пошук поширюється рівномірними концентричними колами, як кола від кинутого у воду каменя.</li>
</ul>
<p>Головна сила BFS полягає в тому, що він гарантовано знаходить найкоротший шлях (з найменшою кількістю переходів) від початкової точки до будь-якої іншої, оскільки він ніколи не перейде до віддалених кварталів, поки не дослідить ближчі.</p>
<h3>Оцінка ефективності (Big O)</h3>
<p><strong>Часова складність:</strong> O(V + E)<br>
Як і у випадку з пошуком в глибину, V &mdash; це кількість перехресть, а E &mdash; кількість вулиць між ними. Щоб ретельно прочесати місто, нам доведеться відвідати кожне перехрестя і пройти кожною вулицею рівно один раз. Час виконання зростає лінійно залежно від розміру графа.</p>
<p><strong>Просторова складність:</strong> O(V)<br>
Пам'ять витрачається на масив міток (щоб знати, де ми вже були) і на чергу (наш "блокнот"). У найгіршому випадку, коли місто має зіркоподібну структуру (величезна кількість вулиць розходиться одночасно від центру), наша черга в певний момент може зберігати інформацію майже про всі вузли графа одночасно.</p>`;
                } else if (currentStructure.includes('graph')) {
                    let startTrav, loopQueue, checkNeighbors;
                    switch (progLang) {
                        case 'python':
                            startTrav = `visited.add(start_vertex)\nqueue = [start_vertex]`;
                            loopQueue = `while queue:\n    current = queue.pop(0)`;
                            checkNeighbors = `for neighbor in self.adj_list[current]:\n    if neighbor not in visited:`;
                            break;
                        case 'java':
                            startTrav = `visited.add(start_vertex);\nq.add(start_vertex);`;
                            loopQueue = `while (!q.isEmpty()) {\n    int current = q.poll();`;
                            checkNeighbors = `for (int neighbor : adj_list.get(current)) {\n    if (!visited.contains(neighbor)) {`;
                            break;
                        case 'javascript':
                            startTrav = `visited.add(start_vertex);\nqueue.push(start_vertex);`;
                            loopQueue = `while (queue.length > 0) {\n    const current = queue.shift();`;
                            checkNeighbors = `for (const neighbor of this.adj_list.get(current)) {\n    if (!visited.has(neighbor)) {`;
                            break;
                        case 'cpp':
                        default:
                            startTrav = `visited.insert(start_vertex);\nq.push(start_vertex);`;
                            loopQueue = `while (!q.empty()) {\n    int current = q.front();\n    q.pop();`;
                            checkNeighbors = `for (int neighbor : adj_list[current]) {\n    if (visited.find(neighbor) == visited.end()) {`;
                            break;
                    }
                    return `<h3>Пошук в ширину (BFS)</h3>
<p>Уявіть, що ви стоїте у своєму рідному місті і хочете дослідити всю країну. Який найлогічніший спосіб це зробити? Найкращий підхід — спочатку відвідати всі міста, безпосередньо з'єднані з вашим (ваших найближчих сусідів). Потім відвідати всіх "сусідів ваших сусідів" (міста на відстані двох кроків), потім міста ще далі, і так далі.</p>
<p>Ваш маршрут розширюється рівномірно в усіх напрямках, наче кола на воді від кинутого в ставок каменя. Цей "хвилеподібний" принцип — це саме те, як працює надзвичайно популярний алгоритм "Пошуку в ширину" (BFS).</p>
<p>Щоб переконатися, що алгоритм не заблукає або не буде ходити по колу (оскільки дороги можуть утворювати петлі), йому потрібні два інструменти:</p>
<ul>
<li><strong>Журнал відвідувань:</strong> Список міст, де ми вже були або куди вже запланували поїхати.</li>
<li><strong>Черга:</strong> Список міст, які чекають на дослідження. Вона працює як звичайна черга в магазині — хто перший прийшов, того першим і обслуговують.</li>
</ul>
<h3>Покрокове пояснення:</h3>
<ul>
<li><strong>Початкова перевірка:</strong> Спочатку навігатор перевіряє, чи дійсно існує місто, з якого ми хочемо почати, на карті. Якщо ні, пошук скасовується.</li>
<li><pre><code>${startTrav}</code></pre><strong>Перший крок:</strong> Ми додаємо наше початкове місто до Журналу відвідувань (щоб ми ніколи туди не поверталися) і поміщаємо його першим у Чергу.</li>
<li><pre><code>${loopQueue}</code></pre><strong>Обробка міста:</strong> Ми беремо найперше місто з Черги та "відвідуємо" його (наприклад, виводимо його назву на екран).</li>
<li><pre><code>${checkNeighbors}</code></pre><strong>Сканування сусідів (Планування):</strong> Перебуваючи в цьому місті, ми дивимося на всі дороги, що ведуть з нього. Ми перевіряємо кожного сусіда: якщо цього сусіда ще немає в нашому Журналі відвідувань, ми негайно записуємо його туди і поміщаємо в самий кінець Черги.</li>
<li><strong>Рух хвилі:</strong> Місто тепер повністю досліджено! Програма знову бере перше місто з Черги (яке буде одним із сусідів) і повторює процес. Оскільки ми завжди додаємо нові міста в кінець черги, алгоритм гарантовано відвідає всіх "близьких" сусідів перед тим, як перейти до "далеких".</li>
<li><strong>Завершення:</strong> Цей процес триває, поки Черга не стане повністю порожньою. Це означає, що ми відвідали всі міста на карті, до яких можна було дістатися дорогами.</li>
</ul>
<h3>Часова складність:</h3>
<ul>
<li><strong>O(V + E) (Лінійний час):</strong> Швидкість алгоритму залежить від кількості вершин (V, міст) і кількості ребер (E, доріг) у нашому графі. Щоб повністю дослідити карту, алгоритм повинен "відвідати" кожне місто рівно один раз і перевірити кожну дорогу рівно один раз. Тому час виконання зростає пропорційно розміру карти. Це дуже ефективний алгоритм, який часто використовується в GPS-навігаторах для пошуку найкоротшого шляху!</li>
</ul>
<p>Бажаєте дізнатися, як Пошук в глибину (DFS) відрізняється від BFS, адже він використовує протилежний підхід, глибоко занурюючись у одну гілку перед тим, як досліджувати інші?</p>`;
                }
                return `Пошук в ширину. Обходить граф рівень за рівнем за допомогою Черги. Часова складність: O(V + E).`;
            },
            'dfs': (progLang) => {
                if (currentStructure === 'undirected-graph') {
                    let safetyCheck, initVisited, callHelper, fieldWork;
                    switch (progLang) {
                        case 'python':
                            safetyCheck = `if startNode >= self.numVertices or startNode < 0:\n    print("Error: Starting node does not exist!")\n    return`;
                            initVisited = `visited = [False] * self.numVertices`;
                            callHelper = `self.dfs_helper(startNode, visited)`;
                            fieldWork = `visited[currentNode] = True\nfor neighbor in self.adj[currentNode]:\n    if not visited[neighbor]:\n        self.dfs_helper(neighbor, visited)`;
                            break;
                        case 'java':
                            safetyCheck = `if (startNode >= numVertices || startNode < 0) {\n    System.out.println("Error: Starting node does not exist!");\n    return;\n}`;
                            initVisited = `boolean[] visited = new boolean[numVertices];`;
                            callHelper = `dfs_helper(startNode, visited);`;
                            fieldWork = `visited[currentNode] = true;\nfor (int neighbor : adj.get(currentNode)) {\n    if (!visited[neighbor]) {\n        dfs_helper(neighbor, visited);\n    }\n}`;
                            break;
                        case 'javascript':
                            safetyCheck = `if (startNode >= this.numVertices || startNode < 0) {\n    console.log("Error: Starting node does not exist!\\n");\n    return;\n}`;
                            initVisited = `const visited = new Array(this.numVertices).fill(false);`;
                            callHelper = `this.dfs_helper(startNode, visited, result);`;
                            fieldWork = `visited[currentNode] = true;\nfor (const neighbor of this.adj[currentNode]) {\n    if (!visited[neighbor]) {\n        this.dfs_helper(neighbor, visited, result);\n    }\n}`;
                            break;
                        case 'cpp':
                        default:
                            safetyCheck = `if (startNode >= numVertices || startNode < 0) {\n    std::cout << "Error: Starting node does not exist!" << std::endl;\n    return;\n}`;
                            initVisited = `std::vector<bool> visited(numVertices, false);`;
                            callHelper = `dfs_helper(startNode, visited);`;
                            fieldWork = `visited[currentNode] = true;\nfor (int neighbor : adj[currentNode]) {\n    if (!visited[neighbor]) {\n        dfs_helper(neighbor, visited);\n    }\n}`;
                            break;
                    }
                    return `<h3>Пошук в глибину (DFS)</h3>
<p><strong>Аналогія з реального життя: Командний центр та Польовий агент</strong></p>
<p>Уявіть, що наше дослідження заплутаного старого міста тепер вийшло на новий рівень. Це вже не самотній турист, а професійна експедиція, де обов'язки чітко розподілені між Командним центром (публічна функція) та Польовим агентом (приватна допоміжна функція).</p>
<p>Ось як логічно розбитий цей процес:</p>
<ul>
<li><pre><code>${safetyCheck}</code></pre><strong>Перевірка координат Штабом (Перевірка безпеки):</strong> Коли надходить наказ розпочати дослідження (виклик публічної функції), Командний центр спочатку дивиться на карту. Якщо клієнт просить почати з перехрестя, якого не існує (від'ємне число або більше за розмір міста), місія негайно скасовується. Штаб не відправляє людей у нікуди.</li>
<li><pre><code>${initVisited}</code></pre><strong>Видача спорядження (Ініціалізація visited):</strong> Якщо координати правильні, Штаб готує для агента абсолютно новий, чистий блокнот (масив visited), де навпроти кожного перехрестя стоїть статус "не відвідано" (false).</li>
<li><pre><code>${callHelper}</code></pre><strong>Делегування роботи (Виклик dfs_helper):</strong> Штаб передає цей блокнот Польовому агенту, вказує стартову точку і каже: "Дій за інструкцією". На цьому активна робота Штабу закінчується; він просто чекає на результати.</li>
<li><pre><code>${fieldWork}</code></pre><strong>Польова робота (Рекурсивна функція):</strong> Польовий агент виконує ту саму рутинну роботу, яку ми обговорювали раніше. Він прибуває на місце, робить позначку в блокноті, звітує по рації, оглядає сусідні вулиці і, якщо він там ще не був, з головою занурюється в них (рекурсивний виклик).</li>
</ul>
<h3>Чому такий підхід кращий?</h3>
<p>Він створює ідеальний "сервіс" для кінцевого користувача. Замовнику дослідження не потрібно самому йти в магазин, купувати чистий блокнот і передавати його агенту. Користувач просто каже: "Почни з вузла 5", а програма сама готує всі необхідні інструменти та запускає приховані механізми.</p>
<h3>Оцінка ефективності (Big O)</h3>
<p>Оскільки під капотом це той самий алгоритм, його ефективність залишається незмінною:</p>
<p><strong>Часова складність:</strong> O(V + E)<br>
Де V &mdash; кількість вершин (перехресть), а E &mdash; кількість ребер (вулиць). Агенту все одно доведеться обійти всю доступну територію, витративши час, пропорційний її розміру.</p>
<p><strong>Просторова складність:</strong> O(V)<br>
Пам'ять витрачається на "блокнот" з мітками для кожної вершини та на підтримку зв'язку зі Штабом (стек рекурсивних викликів, коли агент заходить у глибокі глухі кути).</p>`;
                } else if (currentStructure.includes('graph')) {
                    let markVisited, checkNeighbors;
                    switch (progLang) {
                        case 'python':
                            markVisited = `visited[node] = True`;
                            checkNeighbors = `for neighbor in adj[node]:\n    if not visited[neighbor]:`;
                            break;
                        case 'java':
                            markVisited = `visited[node] = true;`;
                            checkNeighbors = `for (int neighbor : adj.get(node)) {\n    if (!visited[neighbor]) {`;
                            break;
                        case 'javascript':
                            markVisited = `visited[node] = true;`;
                            checkNeighbors = `for (const neighbor of adj[node]) {\n    if (!visited[neighbor]) {`;
                            break;
                        case 'cpp':
                        default:
                            markVisited = `visited[node] = true;`;
                            checkNeighbors = `for (int neighbor : adj[node]) {\n        if (!visited[neighbor]) {`;
                            break;
                    }
                    return `<h3>Пошук в глибину (DFS)</h3>
<p><strong>Аналогія з реального життя: Дослідження лабіринту старого міста</strong></p>
<p>Уявіть, що ви турист, який намагається дослідити абсолютно всі вузькі вулички незнайомого старого міста, щоб нічого не пропустити, але при цьому не ходити колами.</p>
<p>Ось як працює ваша логіка дослідження (яка ідеально відповідає логіці алгоритму DFS):</p>
<ul>
<li><pre><code>${markVisited}</code></pre><strong>Мітка крейдою (Запис про відвідування):</strong> Коли ви прибуваєте на нове перехрестя (в коді це <code>node</code>), ви негайно малюєте хрестик на бруківці крейдою та робите фото цього місця (вивід на екран). Це сигнал вашому майбутньому "я": "Я тут уже був".</li>
<li><strong>Огляд доступних шляхів (Перевірка сусідів):</strong> Ви дивитесь на всі вулиці, що розходяться від цього перехрестя.</li>
<li><pre><code>${checkNeighbors}</code></pre><strong>Занурення в невідоме (Рекурсивний виклик):</strong> Якщо ви бачите вулицю, що веде до перехрестя без вашої мітки крейдою, ви не залишаєтесь, щоб розглянути інші повороти. Ви негайно йдете цією новою вулицею якомога далі.</li>
<li><strong>Повернення назад (Backtracking):</strong> Ви продовжуєте йти глибше, поки не опинитесь у глухому куті або на перехресті, де всі сусідні вулиці вже мають ваші мітки крейдою. Що тоді? Ви просто робите один крок назад (це відбувається автоматично, коли рекурсивна функція завершує своє виконання для поточної точки) і перевіряєте, чи не залишилося інших недосліджених поворотів на попередньому перехресті.</li>
</ul>
<p>Головна особливість цього підходу криється в його назві — "в глибину". Ви завжди намагаєтесь просунутися якомога далі по одному маршруту, перш ніж повертатися назад і перевіряти альтернативи.</p>
<h3>Оцінка ефективності (Big O)</h3>
<p><strong>Часова складність:</strong> O(V + E)</p>
<ul>
<li>V (Вершини) — це кількість перехресть (вузлів).</li>
<li>E (Ребра) — це кількість вулиць між ними (ребер).</li>
</ul>
<p>Алгоритму потрібно відвідати кожне перехрестя і перевірити кожну вулицю один раз, тому час виконання зростає пропорційно розміру всієї карти.</p>
<p><strong>Просторова складність:</strong> O(V)<br>
Нам потрібна додаткова пам'ять для зберігання масиву міток (де ми вже були). Крім того, пам'ять споживається для підтримки самого ланцюга повернення (стек викликів рекурсії). У найгіршому випадку (якщо всі вулиці вишикувані в одну довгу пряму лінію), нам доведеться тримати всі вузли графа в пам'яті одночасно.</p>`;
                }
                return `Пошук в глибину. Йде вглиб графа настільки далеко, наскільки це можливо (за допомогою Стека або рекурсії). Часова складність: O(V + E).`;
            },
            'insert': 'Вставляє нове значення в дерево. Часова складність: O(log n) для збалансованих дерев, O(n) для незбалансованих.',
            'remove': 'Видаляє значення з дерева. Часова складність: O(log n) для збалансованих дерев.',
            'search': 'Шукає значення в дереві. Часова складність: O(log n) для збалансованих дерев.'
        };
        const dict = currentLang === 'uk' ? descUk : descEn;
        const entry = dict[blockId];
        if (typeof entry === 'function') {
            return entry(progLang, algo);
        }
        return entry || (currentLang === 'uk' ? 'Пояснення відсутнє.' : 'No description available.');
    }

    closeModalBtn.addEventListener('click', () => modal.classList.remove('active'));
    modalLangSelect.addEventListener('change', updateModalCode);
    modalAlgoSelect.addEventListener('change', updateModalCode);
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    // =========================================================
    // 11. Логіка Візуалізації (МАЛЮВАННЯ НА ЕКРАНІ)
    // =========================================================
    // Це найскладніший і найважливіший блок.
    // - renderVisualizer(): повністю очищає полотно і малює всі кола, квадрати
    //   та стрілочки заново, опираючись на поточні дані (structureData).
    // Тут багато математики (Math.cos/Math.sin) для вираховування координат SVG ліній.
    function renderVisualizer(animatedIndex = -1, animationClass = '') {
        visualizerContainer.innerHTML = '';
        
        const isEmptyList = currentStructure.includes('list') && Array.isArray(structureData) && structureData.length === 0;
        const isEmptyGraph = currentStructure.includes('graph') && (!structureData || !structureData.vertices || structureData.vertices.length === 0);
        const isEmptyTree = currentStructure.includes('tree') && !structureData;

        if (isEmptyGraph || isEmptyTree) {
            visualizerPlaceholderContainer.style.display = 'flex';
            return;
        } else {
            visualizerPlaceholderContainer.style.display = 'none';
        }

        if (currentStructure === 'singly-linked-list' || currentStructure === 'doubly-linked-list') {
            // Render Linear Nodes
            structureData.forEach((val, index) => {
                const wrapper = document.createElement('div');
                wrapper.className = 'node-wrapper';
                wrapper.style.position = 'relative';
                
                if (index === animatedIndex) {
                    wrapper.classList.add(animationClass);
                }
                
                // Add Head/Tail indicators
                if (index === 0) {
                    const label = document.createElement('div');
                    label.textContent = 'Head';
                    label.style.position = 'absolute';
                    label.style.top = '-25px';
                    label.style.left = '0';
                    label.style.width = '100%';
                    label.style.textAlign = 'center';
                    label.style.fontSize = '0.8rem';
                    label.style.color = '#10b981';
                    label.style.fontWeight = 'bold';
                    wrapper.appendChild(label);
                }
                if (index === structureData.length - 1) {
                    const label = document.createElement('div');
                    label.textContent = 'Tail';
                    label.style.position = 'absolute';
                    label.style.bottom = '-25px';
                    label.style.left = '0';
                    label.style.width = '100%';
                    label.style.textAlign = 'center';
                    label.style.fontSize = '0.8rem';
                    label.style.color = '#ef4444';
                    label.style.fontWeight = 'bold';
                    wrapper.appendChild(label);
                }
                
                const node = document.createElement('div');
                node.className = 'node';
                node.textContent = val;
                
                wrapper.appendChild(node);
                
                const arrow = document.createElement('div');
                arrow.className = 'arrow';
                if (currentStructure === 'doubly-linked-list') arrow.classList.add('double');
                wrapper.appendChild(arrow);
                
                visualizerContainer.appendChild(wrapper);
            });
            
            // Render Tail/NULL
            const endWrapper = document.createElement('div');
            endWrapper.className = 'node-wrapper';
            const endNode = document.createElement('div');
            endNode.className = 'node nullptr';
            endNode.textContent = 'NULL';
            endNode.style.border = '2px dashed rgba(255,255,255,0.15)';
            endNode.style.background = 'transparent';
            endNode.style.color = 'rgba(255,255,255,0.2)';
            endNode.style.boxShadow = 'none';
            
            endWrapper.appendChild(endNode);
            visualizerContainer.appendChild(endWrapper);

        } else if (currentStructure === 'circular-linked-list') {
            const graphContainer = document.createElement('div');
            graphContainer.className = 'graph-container';
            const n = structureData.length;
            
            if (n === 0) return; // handled by isEmptyList

            const radius = Math.max(100, n * 25);
            const cw = visualizerContainer.clientWidth;
            const ch = visualizerContainer.clientHeight;
            const center = { x: Math.max(cw / 2 || 300, radius + 50), y: Math.max(ch / 2 || 150, radius + 50) };
            
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.className = 'graph-edges';
            svg.style.position = 'absolute';
            svg.style.top = '0';
            svg.style.left = '0';
            svg.style.width = '100%';
            svg.style.height = '100%';
            svg.style.minWidth = `${center.x * 2}px`;
            svg.style.minHeight = `${center.y * 2}px`;

            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
            marker.setAttribute('id', 'circ-arrow');
            marker.setAttribute('viewBox', '0 0 10 10');
            marker.setAttribute('refX', '10');
            marker.setAttribute('refY', '5');
            marker.setAttribute('markerWidth', '6');
            marker.setAttribute('markerHeight', '6');
            marker.setAttribute('orient', 'auto-start-reverse');
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
            path.setAttribute('fill', 'var(--accent-primary)');
            marker.appendChild(path);
            defs.appendChild(marker);
            svg.appendChild(defs);

            const positions = [];
            structureData.forEach((val, i) => {
                const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
                const x = center.x + radius * Math.cos(angle);
                const y = center.y + radius * Math.sin(angle);
                positions.push({x, y});

                // Add Head/Tail indicators
                if (i === 0 || i === n - 1) {
                    const label = document.createElement('div');
                    label.textContent = i === 0 ? 'Head' : 'Tail';
                    label.style.position = 'absolute';
                    label.style.left = `${x}px`;
                    label.style.top = i === 0 ? `${y - 25}px` : `${y + 65}px`;
                    label.style.width = '60px'; // approximate node width
                    label.style.textAlign = 'center';
                    label.style.fontSize = '0.85rem';
                    label.style.color = i === 0 ? '#10b981' : '#ef4444';
                    label.style.fontWeight = 'bold';
                    graphContainer.appendChild(label);
                }

                const el = document.createElement('div');
                el.className = 'node graph-node';
                if (i === animatedIndex) el.classList.add(animationClass);
                el.textContent = val;
                el.style.position = 'absolute';
                el.style.left = `${x}px`;
                el.style.top = `${y}px`;
                graphContainer.appendChild(el);
            });

            for (let i = 0; i < n; i++) {
                const p1 = positions[i];
                const p2 = positions[(i + 1) % n];
                
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                // Adjusting to center of node (assumes node is 60x60 -> +30)
                let x1 = p1.x + 30; 
                let y1 = p1.y + 30;
                let x2 = p2.x + 30;
                let y2 = p2.y + 30;
                
                const dx = x2 - x1;
                const dy = y2 - y1;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist > 0) {
                    x1 = x1 + (dx / dist) * 35; 
                    y1 = y1 + (dy / dist) * 35;
                    x2 = x2 - (dx / dist) * 35;
                    y2 = y2 - (dy / dist) * 35;
                    line.setAttribute('marker-end', 'url(#circ-arrow)');
                }
                
                line.setAttribute('x1', x1);
                line.setAttribute('y1', y1);
                line.setAttribute('x2', x2);
                line.setAttribute('y2', y2);
                line.setAttribute('stroke', 'var(--accent-primary)');
                line.setAttribute('stroke-width', '2');
                svg.appendChild(line);
            }
            graphContainer.appendChild(svg);
            visualizerContainer.appendChild(graphContainer);
            
            // Auto-scale if graph is larger than container
            const reqWidth = center.x * 2;
            const reqHeight = center.y * 2;
            const cw2 = visualizerContainer.clientWidth;
            const ch2 = visualizerContainer.clientHeight;
            if (reqWidth > cw2 || reqHeight > ch2) {
                zoomLevel = Math.min(cw2 / reqWidth, ch2 / reqHeight) * 0.95;
                applyCanvasTransform();
            }
        } else if (currentStructure.includes('graph')) {
            const graphContainer = document.createElement('div');
            graphContainer.className = 'graph-container';
            
            const n = structureData.vertices.length;
            const radius = Math.max(120, n * 20);
            const cw = visualizerContainer.clientWidth;
            const ch = visualizerContainer.clientHeight;
            const center = { x: Math.max(cw / 2 || 300, radius + 50), y: Math.max(ch / 2 || 150, radius + 50) };
            
            const positions = {};
            
            // SVG for edges
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.className = 'graph-edges';
            svg.style.position = 'absolute';
            svg.style.top = '0';
            svg.style.left = '0';
            svg.style.width = '100%';
            svg.style.height = '100%';
            svg.style.minWidth = `${center.x * 2}px`;
            svg.style.minHeight = `${center.y * 2}px`;
            
            // Directed arrow marker
            if (currentStructure === 'directed-graph') {
                const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
                const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
                marker.setAttribute('id', 'graph-arrow');
                marker.setAttribute('viewBox', '0 0 10 10');
                marker.setAttribute('refX', '10');
                marker.setAttribute('refY', '5');
                marker.setAttribute('markerWidth', '6');
                marker.setAttribute('markerHeight', '6');
                marker.setAttribute('orient', 'auto-start-reverse');
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
                path.setAttribute('fill', 'var(--accent-primary)');
                marker.appendChild(path);
                defs.appendChild(marker);
                svg.appendChild(defs);
            }
            
            structureData.vertices.forEach((v, i) => {
                const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
                const x = center.x + radius * Math.cos(angle);
                const y = center.y + radius * Math.sin(angle);
                positions[v] = { x, y };
                
                const el = document.createElement('div');
                el.className = 'node graph-node';
                el.textContent = v;
                el.style.position = 'absolute';
                el.style.left = `${x}px`;
                el.style.top = `${y}px`;
                graphContainer.appendChild(el);
            });
            
            structureData.edges.forEach(e => {
                const p1 = positions[e.u];
                const p2 = positions[e.v];
                if (p1 && p2) {
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    let x1 = p1.x + 30;
                    let y1 = p1.y + 30;
                    let x2 = p2.x + 30;
                    let y2 = p2.y + 30;
                    
                    const dx = x2 - x1;
                    const dy = y2 - y1;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    
                    if (dist > 0) {
                        if (currentStructure === 'directed-graph') {
                            x1 = x1 + (dx / dist) * 35;
                            y1 = y1 + (dy / dist) * 35;
                            x2 = x2 - (dx / dist) * 35;
                            y2 = y2 - (dy / dist) * 35;
                            line.setAttribute('marker-end', 'url(#graph-arrow)');
                        }
                        line.setAttribute('x1', x1);
                        line.setAttribute('y1', y1);
                        line.setAttribute('x2', x2);
                        line.setAttribute('y2', y2);
                        line.setAttribute('stroke', 'var(--accent-primary)');
                        line.setAttribute('stroke-width', '2');
                        svg.appendChild(line);
                    } else {
                        // Self-loop
                        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        // Start slightly left of top-center, loop up and right, end slightly right of top-center
                        path.setAttribute('d', `M ${x1 - 10} ${y1 - 30} C ${x1 - 40} ${y1 - 90}, ${x1 + 40} ${y1 - 90}, ${x1 + 10} ${y1 - 30}`);
                        path.setAttribute('fill', 'none');
                        path.setAttribute('stroke', 'var(--accent-primary)');
                        path.setAttribute('stroke-width', '2');
                        if (currentStructure === 'directed-graph') {
                            path.setAttribute('marker-end', 'url(#graph-arrow)');
                        }
                        svg.appendChild(path);
                    }
                }
            });
            
            graphContainer.appendChild(svg);
            visualizerContainer.appendChild(graphContainer);
            
        } else if (currentStructure.includes('tree')) {
            const treeContainer = document.createElement('div');
            treeContainer.className = 'tree-container';
            
            function buildTreeDOM(node) {
                if (!node) {
                    const emptyLi = document.createElement('li');
                    emptyLi.className = 'empty-node';
                    const emptyEl = document.createElement('div');
                    emptyEl.className = 'node hidden-node';
                    emptyLi.appendChild(emptyEl);
                    return emptyLi;
                }
                const li = document.createElement('li');
                
                const el = document.createElement('div');
                el.className = 'node';
                el.textContent = node.val;
                el.dataset.val = node.val;
                li.appendChild(el);
                
                if (node.left || node.right) {
                    const ul = document.createElement('ul');
                    ul.appendChild(buildTreeDOM(node.left));
                    ul.appendChild(buildTreeDOM(node.right));
                    li.appendChild(ul);
                }
                return li;
            }
            
            const rootUl = document.createElement('ul');
            rootUl.appendChild(buildTreeDOM(structureData));
            treeContainer.appendChild(rootUl);
            visualizerContainer.appendChild(treeContainer);
        }
    }

    document.getElementById('speed-slider').addEventListener('input', (e) => {
        animationSpeedMultiplier = parseFloat(e.target.value);
        document.getElementById('speed-label').textContent = `Speed: ${animationSpeedMultiplier}x`;
    });

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms / animationSpeedMultiplier));
    }

    async function checkPause() {
        while (isPaused) {
            await sleep(100);
        }
    }

    async function executeBlockAction(blockId, val) {
        const nodes = document.querySelectorAll('#visualizer-container .node:not(.nullptr)');
        let v1 = Array.isArray(val) ? val[0] : val;
        let v2 = Array.isArray(val) ? val[1] : null;

        if (blockId === 'add_head') {
            structureData.unshift(v1 || '0');
            renderVisualizer(0, 'anim-enter');
            await sleep(700);
        } else if (blockId === 'add_tail') {
            structureData.push(v1 || '0');
            renderVisualizer(structureData.length - 1, 'anim-enter');
            await sleep(700);
        } else if (blockId === 'remove_head') {
            if (structureData.length > 0 && nodes.length > 0) {
                nodes[0].parentElement.classList.add('anim-exit');
                await sleep(700);
                structureData.shift();
                renderVisualizer();
            }
        } else if (blockId === 'remove_tail') {
            if (structureData.length > 0 && nodes.length > 0) {
                nodes[nodes.length - 1].parentElement.classList.add('anim-exit');
                await sleep(700);
                structureData.pop();
                renderVisualizer();
            }
        } else if (blockId === 'insert_at') {
            let index = parseInt(v1);
            let value = v2 || '0';
            if (isNaN(index) || index < 0 || index > structureData.length) {
                const visualizerText = document.createElement('p');
                visualizerText.style.position = 'absolute';
                visualizerText.style.top = '10px';
                visualizerText.style.fontWeight = 'bold';
                visualizerText.style.color = '#ef4444';
                visualizerText.textContent = currentLang === 'uk' ? `Помилка: Неможливо вставити на позицію ${index} (допустимо 0-${structureData.length})` : `Error: Cannot insert at position ${index} (valid range 0-${structureData.length})`;
                visualizerContainer.appendChild(visualizerText);
                await sleep(2500);
                visualizerText.remove();
                return;
            }
            structureData.splice(index, 0, value);
            renderVisualizer(index, 'anim-enter');
            await sleep(700);
        } else if (blockId === 'reverse') {
            if (structureData.length > 1) {
                // Swap Head/Tail labels visually
                const allLabels = document.querySelectorAll('#visualizer-container div');
                allLabels.forEach(label => {
                    if (label.textContent === 'Head') {
                        label.textContent = 'Tail';
                        label.style.color = '#ef4444';
                    } else if (label.textContent === 'Tail') {
                        label.textContent = 'Head';
                        label.style.color = '#10b981';
                    }
                });

                if (currentStructure === 'circular-linked-list') {
                    const lines = document.querySelectorAll('#visualizer-container svg line');
                    for (let i = 0; i < lines.length; i++) {
                        let x1 = lines[i].getAttribute('x1');
                        let y1 = lines[i].getAttribute('y1');
                        let x2 = lines[i].getAttribute('x2');
                        let y2 = lines[i].getAttribute('y2');
                        lines[i].style.transition = 'all 0.4s ease';
                        lines[i].setAttribute('x1', x2);
                        lines[i].setAttribute('y1', y2);
                        lines[i].setAttribute('x2', x1);
                        lines[i].setAttribute('y2', y1);
                        await sleep(200);
                        await checkPause();
                    }
                } else {
                    const arrows = document.querySelectorAll('#visualizer-container .arrow');
                    for(let i = 0; i < arrows.length; i++) {
                        arrows[i].style.transition = 'transform 0.4s ease';
                        arrows[i].style.transform = 'rotate(180deg)';
                        await sleep(400);
                        await checkPause();
                    }
                }
                
                await sleep(800); // Give user time to see the arrows flipped
                structureData.reverse();
                renderVisualizer();
            }
        } else if (blockId === 'bfs' || blockId === 'dfs') {
            if (!structureData.vertices || structureData.vertices.length === 0) return;
            let startNode = v1 || structureData.vertices[0];
            
            const visualizerText = document.createElement('p');
            visualizerText.style.position = 'absolute';
            visualizerText.style.top = '10px';
            visualizerText.style.fontWeight = 'bold';
            visualizerText.style.color = 'var(--text-main)';
            visualizerContainer.appendChild(visualizerText);

            if (!structureData.vertices.includes(startNode)) {
                visualizerText.textContent = currentLang === 'uk' ? `Помилка: Вершина ${startNode} не знайдена!` : `Error: Vertex ${startNode} not found!`;
                visualizerText.style.color = '#ef4444';
                await sleep(2000);
                visualizerText.remove();
                return;
            } else {
                visualizerText.textContent = currentLang === 'uk' ? `Початок ${blockId.toUpperCase()} з вершини ${startNode}` : `Starting ${blockId.toUpperCase()} from node ${startNode}`;
                visualizerText.style.color = '#10b981';
                setTimeout(() => visualizerText.remove(), 3000);
            }
            
            const statusContainer = document.createElement('div');
            statusContainer.style.position = 'absolute';
            statusContainer.style.bottom = '10px';
            statusContainer.style.left = '10px';
            statusContainer.style.color = 'var(--text-main)';
            statusContainer.style.background = 'rgba(0,0,0,0.6)';
            statusContainer.style.padding = '10px';
            statusContainer.style.borderRadius = '8px';
            statusContainer.innerHTML = `
                <div style="margin-bottom: 5px; font-family: monospace;"><strong>${blockId === 'bfs' ? translations[currentLang].queue : translations[currentLang].stack}</strong> <span id="ds-container">[]</span></div>
                <div style="font-family: monospace;"><strong>${translations[currentLang].visited}</strong> <span id="vis-container">[]</span></div>
            `;
            visualizerContainer.appendChild(statusContainer);
            
            let ds = []; 
            let visited = [];
            
            ds.push(startNode);
            
            const adj = {};
            structureData.vertices.forEach(v => adj[v] = []);
            structureData.edges.forEach(e => {
                adj[e.u].push(e.v);
                if (currentStructure === 'undirected-graph') {
                    adj[e.v].push(e.u);
                }
            });
            
            const updateUI = async () => {
                document.getElementById('ds-container').textContent = JSON.stringify(ds);
                document.getElementById('vis-container').textContent = JSON.stringify(visited);
                await sleep(600);
            };
            
            const domNodes = Array.from(document.querySelectorAll('.graph-node'));
            
            while (ds.length > 0) {
                await checkPause();
                let current = blockId === 'bfs' ? ds.shift() : ds.pop();
                
                if (!visited.includes(current)) {
                    visited.push(current);
                    
                    let targetDom = domNodes.find(n => n.textContent === current);
                    if (targetDom) {
                        targetDom.style.backgroundColor = '#f59e0b';
                        targetDom.style.transform = 'scale(1.2)';
                        await updateUI();
                        targetDom.style.backgroundColor = '#10b981';
                        targetDom.style.transform = 'scale(1)';
                    }
                    
                    let neighbors = adj[current];
                    for (let neighbor of neighbors) {
                        if (!visited.includes(neighbor) && !ds.includes(neighbor)) {
                            ds.push(neighbor);
                        }
                    }
                    await updateUI();
                }
            }
            await sleep(1500);
            statusContainer.remove();
            renderVisualizer(); 
        } else if (blockId === 'add_vertex') {
            if (!structureData.vertices) structureData = { vertices: [], edges: [] };
            if (!structureData.vertices.includes(v1)) {
                structureData.vertices.push(v1);
                renderVisualizer(-1, 'anim-enter');
                await sleep(500);
            }
        } else if (blockId === 'add_edge') {
            if (!structureData.vertices) structureData = { vertices: [], edges: [] };
            
            const visualizerText = document.createElement('p');
            visualizerText.style.position = 'absolute';
            visualizerText.style.top = '10px';
            visualizerText.style.fontWeight = 'bold';
            visualizerText.style.color = '#ef4444';
            
            if (!structureData.vertices.includes(v1) || !structureData.vertices.includes(v2)) {
                visualizerText.textContent = currentLang === 'uk' ? `Помилка: Вершини ${v1} або ${v2} не існують!` : `Error: Vertices ${v1} or ${v2} do not exist!`;
                visualizerContainer.appendChild(visualizerText);
                await sleep(2000);
                visualizerText.remove();
                return;
            }
            
            structureData.edges.push({u: v1, v: v2});
            renderVisualizer();
            await sleep(500);
        } else if (blockId === 'insert') {
            // Tree insert
            if (!structureData) {
                structureData = { val: v1, left: null, right: null };
            } else {
                // simple insert placeholder
                let curr = structureData;
                while (curr) {
                    if (parseInt(v1) < parseInt(curr.val)) {
                        if (!curr.left) { curr.left = { val: v1, left: null, right: null }; break; }
                        curr = curr.left;
                    } else {
                        if (!curr.right) { curr.right = { val: v1, left: null, right: null }; break; }
                        curr = curr.right;
                    }
                }
            }
            renderVisualizer();
            await sleep(700);
        } else if (blockId === 'search') {
            const visualizerText = document.createElement('p');
            visualizerText.style.position = 'absolute';
            visualizerText.style.top = '10px';
            visualizerText.style.fontWeight = 'bold';
            visualizerText.style.color = 'var(--text-main)';
            visualizerContainer.appendChild(visualizerText);
            
            if (!structureData) {
                visualizerText.textContent = `Tree is empty! Cannot find ${v1}.`;
                visualizerText.style.color = '#ef4444';
                await sleep(2000);
                visualizerText.remove();
                return;
            }
            
            const searchNode = document.createElement('div');
            searchNode.className = 'node';
            searchNode.textContent = v1;
            searchNode.style.position = 'absolute';
            searchNode.style.zIndex = '100';
            searchNode.style.transition = 'all 0.6s ease';
            searchNode.style.backgroundColor = 'var(--accent-secondary)';
            searchNode.style.left = '10px';
            searchNode.style.top = '50px';
            visualizerContainer.appendChild(searchNode);

            let curr = structureData;
            let found = false;
            while (curr) {
                const domNodes = document.querySelectorAll('.tree-container .node:not(.hidden-node)');
                let targetNode = Array.from(domNodes).find(n => n.dataset.val == curr.val);
                
                let op = parseInt(v1) === parseInt(curr.val) ? '=' : (parseInt(v1) < parseInt(curr.val) ? '<' : '>');
                
                if (targetNode) {
                    const rect = targetNode.getBoundingClientRect();
                    const containerRect = visualizerContainer.getBoundingClientRect();
                    
                    searchNode.style.left = `${rect.left - containerRect.left + 70}px`;
                    searchNode.style.top = `${rect.top - containerRect.top}px`;
                    
                    const operator = document.createElement('div');
                    operator.style.position = 'absolute';
                    operator.style.left = `${rect.left - containerRect.left + 50}px`;
                    operator.style.top = `${rect.top - containerRect.top + 12}px`;
                    operator.style.fontWeight = 'bold';
                    operator.style.fontSize = '24px';
                    operator.style.zIndex = '100';
                    operator.textContent = op;
                    if (op === '=') operator.style.color = '#10b981';
                    visualizerContainer.appendChild(operator);
                    
                    targetNode.classList.add('anim-highlight-yellow');
                    visualizerText.textContent = `Comparing ${v1} with ${curr.val}...`;
                    
                    await sleep(1000);
                    operator.remove();
                    targetNode.classList.remove('anim-highlight-yellow');
                }
                
                if (op === '=') {
                    found = true;
                    if (targetNode) targetNode.style.borderColor = '#10b981';
                    searchNode.style.backgroundColor = '#10b981';
                    break;
                } else if (op === '<') {
                    curr = curr.left;
                } else {
                    curr = curr.right;
                }
            }
            if (!found) {
                visualizerText.textContent = `Value ${v1} not found in the tree!`;
                visualizerText.style.color = '#ef4444';
                searchNode.style.backgroundColor = '#ef4444';
            } else {
                visualizerText.textContent = `Found ${v1}!`;
                visualizerText.style.color = '#10b981';
            }
            await sleep(2500);
            visualizerText.remove();
            searchNode.remove();
            renderVisualizer();
        } else if (blockId === 'print') {
            for (let i = 0; i < nodes.length; i++) {
                nodes[i].classList.add('anim-highlight-yellow');
                await sleep(700);
                nodes[i].classList.remove('anim-highlight-yellow');
            }
        } else if (blockId === 'sort') {
            let n = structureData.length;
            if (v1 === 'Selection Sort') {
                for (let i = 0; i < n - 1; i++) {
                    let minIdx = i;
                    const nodes = document.querySelectorAll('#visualizer-container .node:not(.nullptr)');
                    nodes[minIdx].classList.add('anim-highlight-yellow');
                    
                    for (let j = i + 1; j < n; j++) {
                        nodes[j].classList.add('anim-highlight-yellow');
                        await sleep(400);
                        await checkPause();
                        
                        if (parseInt(structureData[j]) < parseInt(structureData[minIdx])) {
                            nodes[minIdx].classList.remove('anim-highlight-yellow');
                            nodes[minIdx].style.borderColor = '';
                            minIdx = j;
                            nodes[minIdx].classList.add('anim-highlight-yellow');
                            nodes[minIdx].style.borderColor = '#3b82f6';
                        } else {
                            nodes[j].classList.remove('anim-highlight-yellow');
                        }
                    }
                    
                    if (minIdx !== i) {
                        let temp = structureData[i];
                        structureData[i] = structureData[minIdx];
                        structureData[minIdx] = temp;
                        
                        nodes[i].textContent = structureData[i];
                        nodes[minIdx].textContent = structureData[minIdx];
                        
                        nodes[i].style.backgroundColor = '#10b981';
                        nodes[minIdx].style.backgroundColor = '#10b981';
                        await sleep(600);
                        nodes[i].style.backgroundColor = '';
                        nodes[minIdx].style.backgroundColor = '';
                    }
                    nodes[i].style.borderColor = '';
                    nodes[minIdx].style.borderColor = '';
                    nodes[minIdx].classList.remove('anim-highlight-yellow');
                    nodes[i].classList.remove('anim-highlight-yellow');
                }
            } else if (v1 === 'Insertion Sort') {
                for (let i = 1; i < n; i++) {
                    let key = parseInt(structureData[i]);
                    let j = i - 1;
                    const nodes = document.querySelectorAll('#visualizer-container .node:not(.nullptr)');
                    
                    nodes[i].classList.add('anim-highlight-yellow');
                    await sleep(500);
                    
                    while (j >= 0 && parseInt(structureData[j]) > key) {
                        nodes[j].classList.add('anim-highlight-yellow');
                        await sleep(400);
                        await checkPause();
                        
                        structureData[j + 1] = structureData[j];
                        nodes[j + 1].textContent = structureData[j + 1];
                        
                        nodes[j].classList.remove('anim-highlight-yellow');
                        j = j - 1;
                    }
                    structureData[j + 1] = key;
                    nodes[j + 1].textContent = key;
                    nodes[j + 1].style.backgroundColor = '#10b981';
                    await sleep(500);
                    nodes[j + 1].style.backgroundColor = '';
                    nodes[i].classList.remove('anim-highlight-yellow');
                }
            } else if (v1 === 'Quick Sort') {
                async function quickSortLogic(arr, low, high) {
                    if (low < high) {
                        let pi = await partition(arr, low, high);
                        await quickSortLogic(arr, low, pi - 1);
                        await quickSortLogic(arr, pi + 1, high);
                    }
                }
                async function partition(arr, low, high) {
                    const nodes = document.querySelectorAll('#visualizer-container .node:not(.nullptr)');
                    let pivot = parseInt(arr[high]);
                    nodes[high].style.borderColor = '#ef4444';
                    let i = low - 1;
                    
                    for (let j = low; j <= high - 1; j++) {
                        nodes[j].classList.add('anim-highlight-yellow');
                        await sleep(300);
                        await checkPause();
                        
                        if (parseInt(arr[j]) < pivot) {
                            i++;
                            let temp = arr[i];
                            arr[i] = arr[j];
                            arr[j] = temp;
                            
                            nodes[i].textContent = arr[i];
                            nodes[j].textContent = arr[j];
                        }
                        nodes[j].classList.remove('anim-highlight-yellow');
                    }
                    
                    let temp = arr[i+1];
                    arr[i+1] = arr[high];
                    arr[high] = temp;
                    
                    nodes[i+1].textContent = arr[i+1];
                    nodes[high].textContent = arr[high];
                    
                    nodes[high].style.borderColor = '';
                    nodes[i+1].style.backgroundColor = '#10b981';
                    await sleep(400);
                    nodes[i+1].style.backgroundColor = '';
                    
                    return i + 1;
                }
                await quickSortLogic(structureData, 0, n - 1);
            } else {
                // Bubble Sort Visualization
                for (let i = 0; i < n - 1; i++) {
                    for (let j = 0; j < n - i - 1; j++) {
                        const currentNodes = document.querySelectorAll('#visualizer-container .node:not(.nullptr)');
                        
                        currentNodes[j].classList.add('anim-highlight-yellow');
                        currentNodes[j+1].classList.add('anim-highlight-yellow');
                        await sleep(700);
                        await checkPause();
                        
                        if (parseInt(structureData[j]) > parseInt(structureData[j+1])) {
                            currentNodes[j].classList.remove('anim-highlight-yellow');
                            currentNodes[j+1].classList.remove('anim-highlight-yellow');
                            
                            const isCircular = currentStructure === 'circular-linked-list';
                            if (!isCircular) {
                                currentNodes[j].classList.add('anim-swap-right');
                                currentNodes[j+1].classList.add('anim-swap-left');
                            }
                            
                            await sleep(800);
                            
                            let temp = structureData[j];
                            structureData[j] = structureData[j+1];
                            structureData[j+1] = temp;
                            
                            currentNodes[j].textContent = structureData[j];
                            currentNodes[j+1].textContent = structureData[j+1];
                            
                            if (!isCircular) {
                                currentNodes[j].classList.remove('anim-swap-right');
                                currentNodes[j+1].classList.remove('anim-swap-left');
                            }
                        } else {
                            currentNodes[j].classList.remove('anim-highlight-yellow');
                            currentNodes[j+1].classList.remove('anim-highlight-yellow');
                        }
                    }
                }
            }
        }
    }
    // =========================================================
    // 13. Движок Виконання Алгоритмів (EXECUTION ENGINE)
    // =========================================================
    // Цей код читає всі блоки з Робочої Області, перевіряє їхні назви
    // (наприклад, 'add_head', 'sort', 'bfs') і виконує відповідні дії.
    // Він використовує async/await для того, щоб чекати закінчення
    // анімації (через await sleep(ms)) перед виконанням наступного блоку.
    async function runScript() {
        if (isExecuting && !isPaused) return;
        
        executionId++;
        const currentExecId = executionId;
        
        if (isPaused) {
            isPaused = false;
            btnPause.textContent = '⏸ Pause';
            btnPause.classList.remove('primary');
            btnPause.classList.add('secondary');
        }

        const blocks = document.querySelectorAll('.workspace-block');
        if (blocks.length === 0) return;

        // Reset visualization data to start fresh on Run
        if (currentStructure.includes('graph')) {
            structureData = { vertices: [], edges: [] };
        } else if (currentStructure.includes('tree')) {
            structureData = null;
        } else {
            structureData = [];
        }
        renderVisualizer();

        isExecuting = true;
        btnRun.disabled = true;
        btnStep.disabled = true;
        stepIndex = 0; 

        for (let i = 0; i < blocks.length; i++) {
            if (currentExecId !== executionId) return;

            const block = blocks[i];
            
            blocks.forEach(b => b.classList.remove('executing'));
            block.classList.add('executing');
            block.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

            const blockId = block.dataset.blockId;
            let vals = [];
            block.querySelectorAll('input').forEach(inp => vals.push(inp.value));
            const sel = block.querySelector('select');
            if (sel) vals.push(sel.value);
            let val = vals.length === 0 ? null : (vals.length === 1 ? vals[0] : vals);
            
            await sleep(400); 
            if (currentExecId !== executionId) return;
            await checkPause();
            if (currentExecId !== executionId) return;
            await executeBlockAction(blockId, val);
            if (currentExecId !== executionId) return;
            await sleep(400); 
        }

        if (currentExecId === executionId) {
            blocks.forEach(b => b.classList.remove('executing'));
            isExecuting = false;
            btnRun.disabled = false;
            btnStep.disabled = false;
            stepIndex = 0;
        }
    }

    async function stepScript() {
        if (isExecuting) return;
        
        const blocks = document.querySelectorAll('.workspace-block');
        if (blocks.length === 0 || stepIndex >= blocks.length) {
            stepIndex = 0; 
            blocks.forEach(b => b.classList.remove('executing'));
            return;
        }

        isExecuting = true;
        btnRun.disabled = true;
        btnStep.disabled = true;
        
        const block = blocks[stepIndex];
        
        blocks.forEach(b => b.classList.remove('executing'));
        block.classList.add('executing');
        block.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        const blockId = block.dataset.blockId;
        let vals = [];
        block.querySelectorAll('input').forEach(inp => vals.push(inp.value));
        const sel = block.querySelector('select');
        if (sel) vals.push(sel.value);
        let val = vals.length === 0 ? null : (vals.length === 1 ? vals[0] : vals);
        
        await sleep(300);
        await executeBlockAction(blockId, val);
        
        stepIndex++;
        isExecuting = false;
        btnRun.disabled = false;
        btnStep.disabled = false;
    }

    btnRun.addEventListener('click', () => {
        isPaused = false;
        btnPause.textContent = '⏸ Pause';
        btnPause.classList.remove('primary');
        btnPause.classList.add('secondary');
        runScript();
    });
    btnStep.addEventListener('click', stepScript);
    
    btnPause.addEventListener('click', () => {
        if (!isExecuting) return;
        isPaused = !isPaused;
        btnPause.textContent = isPaused ? '▶ Resume' : '⏸ Pause';
        if (isPaused) {
            btnPause.classList.add('primary');
            btnPause.classList.remove('secondary');
        } else {
            btnPause.classList.remove('primary');
            btnPause.classList.add('secondary');
        }
    });
    
    btnClearVis.addEventListener('click', () => {
        if (currentStructure.includes('graph')) {
            structureData = { vertices: [], edges: [] };
        } else if (currentStructure.includes('tree')) {
            structureData = null;
        } else {
            structureData = [];
        }
        renderVisualizer();
        stepIndex = 0;
        document.querySelectorAll('.workspace-block').forEach(b => b.classList.remove('executing'));
    });

    btnClearScript.addEventListener('click', () => {
        const t = translations[currentLang];
        workspaceContainer.innerHTML = `<p class="empty-text">${t.empty_workspace || 'Click a block above to add it here...'}</p>`;
        stepIndex = 0;
        saveScript();
    });

    // =========================================================
    // 12. Ініціалізація (СТАРТ ПРОГРАМИ)
    // =========================================================
    // Цей код виконується найпершим при завантаженні сторінки (після перекладів).
    // Він встановлює кліки на меню (наприклад, перемикання з Графів на Списки)
    // і малює початкову пусту структуру.
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            currentStructure = item.getAttribute('data-structure');
            visualizerPlaceholderText.textContent = `Visualizing: ${item.textContent}`;
            
            if (currentStructure.includes('graph')) {
                structureData = { vertices: [], edges: [] };
            } else if (currentStructure.includes('tree')) {
                structureData = null;
            } else {
                structureData = [];
            }
            renderVisualizer();
            renderPalette();
            loadScript();
            stepIndex = 0;
            document.querySelectorAll('.workspace-block').forEach(b => b.classList.remove('executing'));
        });
    });

    renderPalette();
    loadScript();
    initSidebarToggle();
    initPaletteToggle();
    initBlocksPanelResize();
    initMainPanelResize();
});

