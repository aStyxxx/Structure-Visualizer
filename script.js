document.addEventListener('DOMContentLoaded', () => {
    // --- UI Elements ---
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

    // --- State ---
    let currentStructure = 'singly-linked-list';
    let structureData = [];
    let isExecuting = false;
    let executionId = 0;
    let isPaused = false;
    let stepIndex = 0;

    // --- Localization ---
    const translations = {
        'en': {
            'visualizing': 'Visualizing',
            'run': '▶ Run',
            'pause': '⏸ Pause',
            'resume': '▶ Resume',
            'step': '⏭ Step',
            'clear_vis': '⏹ Clear Vis',
            'clear_script': '🗑 Clear Script',
            'empty_workspace': 'Click a block above to add it here...',
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
            'visited': 'Visited:'
        },
        'uk': {
            'visualizing': 'Візуалізація',
            'run': '▶ Запуск',
            'pause': '⏸ Пауза',
            'resume': '▶ Продовжити',
            'step': '⏭ Крок',
            'clear_vis': '⏹ Очистити Віз.',
            'clear_script': '🗑 Оч. Скрипт',
            'empty_workspace': 'Натисніть на блок вище, щоб додати його сюди...',
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
            'visited': 'Відвідані:'
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
        // Home Page updates
        const homeSubtitle = document.getElementById('home-subtitle');
        if (homeSubtitle) {
            homeSubtitle.textContent = currentLang === 'uk' ? 'Інтерактивний візуалізатор структур даних' : 'Interactive Data Structure Visualizer';
            document.getElementById('home-desc-en').style.display = currentLang === 'en' ? 'block' : 'none';
            document.getElementById('home-desc-uk').style.display = currentLang === 'uk' ? 'block' : 'none';
            document.getElementById('home-btn-text').textContent = currentLang === 'uk' ? 'Спробувати візуалізатор' : 'Try Visualizer';
            
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

    // --- Sidebar Collapse ---
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
            sidebarShowBtn.style.display = 'block';
        });

        sidebarShowBtn.addEventListener('click', () => {
            appContainer.classList.remove('is-sidebar-hidden');
            sidebarShowBtn.style.display = 'none';
        });
    }

    // --- Palette Toggle ---
    function initPaletteToggle() {
        const mainContent = document.querySelector('.main-content');
        if (!blocksPanel || !paletteCloseBtn || !paletteShowBtn || !mainContent || !paletteColumn) return;

        paletteCloseBtn.addEventListener('click', () => {
            const paletteWidth = paletteColumn.offsetWidth;
            blocksPanel.style.width = ''; // clear any old inline widths just in case
            
            const currentMainWidth = mainContent.offsetWidth;
            blocksPanel.dataset.hiddenPaletteWidth = paletteWidth;
            mainContent.style.flex = `0 0 ${currentMainWidth + paletteWidth}px`;
            
            blocksPanel.classList.add('is-palette-hidden');
            paletteColumn.classList.add('collapsed');
            paletteCloseBtn.style.display = 'none';
            paletteShowBtn.style.display = 'block';
        });

        paletteShowBtn.addEventListener('click', () => {
            blocksPanel.classList.remove('is-palette-hidden');
            paletteColumn.classList.remove('collapsed');
            
            const paletteWidthToRestore = parseFloat(blocksPanel.dataset.hiddenPaletteWidth) || 200;
            const currentMainWidth = mainContent.offsetWidth;
            mainContent.style.flex = `0 0 ${Math.max(300, currentMainWidth - paletteWidthToRestore)}px`;
            
            paletteCloseBtn.style.display = 'block';
            paletteShowBtn.style.display = 'none';
        });
    }

    // --- Blocks Panel Resize ---
    function initBlocksPanelResize() {
        if (!blocksPanel || !paletteColumn || !workspaceColumn || !blocksResizer) return;

        const minColumnWidth = 200;
        const resizeStep = 20;
        let startX = 0;
        let startPaletteWidth = 0;
        let totalResizableWidth = 0;

        const setPaletteWidth = (width, totalWidth = paletteColumn.offsetWidth + workspaceColumn.offsetWidth) => {
            if (totalWidth <= 0) return;

            const maxPaletteWidth = Math.max(minColumnWidth, totalWidth - minColumnWidth);
            const nextWidth = Math.min(Math.max(width, minColumnWidth), maxPaletteWidth);
            blocksPanel.style.setProperty('--palette-column-width', `${nextWidth}px`);
            blocksResizer.setAttribute('aria-valuenow', Math.round((nextWidth / totalWidth) * 100));
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
        let startMainWidth = 0;

        const resize = (event) => {
            const delta = event.clientX - startX;
            const minBlocksWidth = blocksPanel.classList.contains('is-palette-hidden') ? 200 : 400;
            
            const sidebarWidth = appContainer.classList.contains('is-sidebar-hidden') ? 0 : sidebar.offsetWidth;
            const resizerWidth = mainResizer.offsetWidth || 8;
            
            const maxMainWidth = window.innerWidth - sidebarWidth - minBlocksWidth - resizerWidth;
            const minMainWidth = 300;
            
            let nextWidth = startMainWidth + delta;
            nextWidth = Math.min(Math.max(nextWidth, minMainWidth), maxMainWidth);
            
            mainContent.style.flex = `0 0 ${nextWidth}px`;
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
            startMainWidth = mainContent.offsetWidth;

            document.body.classList.add('is-resizing-main');
            mainResizer.setPointerCapture?.(event.pointerId);
            window.addEventListener('pointermove', resize);
            window.addEventListener('pointerup', stopResize);
            window.addEventListener('pointercancel', stopResize);
        });
    }

    // --- Canvas Zoom & Pan ---
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

    // --- Block Definitions & Code ---
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
        }
    };

    // --- Render Palette ---
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

    // --- Workspace Logic ---
    function addBlockToWorkspace(blockDef, defaultVals) {
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

        // Delete button
        const delBtn = document.createElement('button');
        delBtn.className = 'block-delete';
        delBtn.textContent = '×';
        delBtn.addEventListener('click', () => {
            blockObj.remove();
            if (workspaceContainer.children.length === 0) {
                workspaceContainer.innerHTML = '<p class="empty-text">Click a block above to add it here...</p>';
            }
            stepIndex = 0; // reset step index
        });
        blockObj.appendChild(delBtn);

        workspaceContainer.appendChild(blockObj);
        stepIndex = 0; // reset step if we edit the script
    }

    // --- Modal Logic ---
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
            modalDesc.innerHTML = getAlgorithmDescription(currentModalBlockId, algo);
        }
    }

    function getAlgorithmDescription(blockId, algo) {
        const descEn = {
            'add_head': 'Adds a new node to the beginning of the list. Time Complexity: O(1).',
            'add_tail': 'Adds a new node to the end of the list. Time Complexity: O(n) without a tail pointer, O(1) with a tail pointer.',
            'insert_at': 'Inserts a new node at the specified index. Time Complexity: O(n).',
            'remove_head': 'Removes the first node of the list. Time Complexity: O(1).',
            'remove_tail': 'Removes the last node. Time Complexity: O(n) for singly linked, O(1) for doubly linked if tail pointer exists.',
            'reverse': 'Reverses the direction of all pointers in the list. Time Complexity: O(n).',
            'print': 'Iterates through the list to display all elements. Time Complexity: O(n).',
            'sort': `Sorts the list using ${algo || 'the chosen algorithm'}.`,
            'add_vertex': 'Adds a new vertex to the graph. Time Complexity: O(1).',
            'add_edge': 'Adds a directed or undirected edge between two vertices. Time Complexity: O(1) for adjacency list.',
            'bfs': 'Breadth-First Search. Explores the graph layer by layer using a Queue. Time Complexity: O(V + E).',
            'dfs': 'Depth-First Search. Explores as far as possible along each branch before backtracking using a Stack (or recursion). Time Complexity: O(V + E).',
            'insert': 'Inserts a new value into the tree. Time Complexity: O(log n) for balanced trees, O(n) for skewed trees.',
            'remove': 'Removes a value from the tree. Time Complexity: O(log n) for balanced trees.',
            'search': 'Searches for a value in the tree. Time Complexity: O(log n) for balanced trees.'
        };
        const descUk = {
            'add_head': 'Додає новий вузол на початок списку. Часова складність: O(1).',
            'add_tail': 'Додає новий вузол в кінець списку. Часова складність: O(n) без вказівника на хвіст, O(1) з вказівником.',
            'insert_at': 'Вставляє новий вузол за вказаним індексом. Часова складність: O(n).',
            'remove_head': 'Видаляє перший вузол списку. Часова складність: O(1).',
            'remove_tail': 'Видаляє останній вузол. Часова складність: O(n) для однозв\'язного, O(1) для двозв\'язного (якщо є вказівник на хвіст).',
            'reverse': 'Змінює напрямок всіх вказівників у списку на протилежний. Часова складність: O(n).',
            'print': 'Проходить по списку для виводу всіх елементів. Часова складність: O(n).',
            'sort': `Сортує список використовуючи ${algo || 'обраний алгоритм'}.`,
            'add_vertex': 'Додає нову вершину до графа. Часова складність: O(1).',
            'add_edge': 'Додає орієнтоване або неорієнтоване ребро між двома вершинами. Часова складність: O(1) (для списків суміжності).',
            'bfs': 'Пошук в ширину. Обходить граф рівень за рівнем за допомогою Черги. Часова складність: O(V + E).',
            'dfs': 'Пошук в глибину. Йде вглиб графа настільки далеко, наскільки це можливо (за допомогою Стека або рекурсії). Часова складність: O(V + E).',
            'insert': 'Вставляє нове значення в дерево. Часова складність: O(log n) для збалансованих дерев, O(n) для незбалансованих.',
            'remove': 'Видаляє значення з дерева. Часова складність: O(log n) для збалансованих дерев.',
            'search': 'Шукає значення в дереві. Часова складність: O(log n) для збалансованих дерев.'
        };
        const dict = currentLang === 'uk' ? descUk : descEn;
        return dict[blockId] || (currentLang === 'uk' ? 'Пояснення відсутнє.' : 'No description available.');
    }

    closeModalBtn.addEventListener('click', () => modal.classList.remove('active'));
    modalLangSelect.addEventListener('change', updateModalCode);
    modalAlgoSelect.addEventListener('change', updateModalCode);
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    // --- Visualization Logic ---
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
                    let x1 = p1.x + 25;
                    let y1 = p1.y + 25;
                    let x2 = p2.x + 25;
                    let y2 = p2.y + 25;
                    
                    if (currentStructure === 'directed-graph') {
                        const dx = x2 - x1;
                        const dy = y2 - y1;
                        const dist = Math.sqrt(dx*dx + dy*dy);
                        if (dist > 0) {
                            // Shorten by node radius (25px) + border (approx 28px)
                            x2 = x2 - (dx / dist) * 28;
                            y2 = y2 - (dy / dist) * 28;
                            line.setAttribute('marker-end', 'url(#graph-arrow)');
                        }
                    }
                    
                    line.setAttribute('x1', x1);
                    line.setAttribute('y1', y1);
                    line.setAttribute('x2', x2);
                    line.setAttribute('y2', y2);
                    line.setAttribute('stroke', 'var(--accent-primary)');
                    line.setAttribute('stroke-width', '2');
                    svg.appendChild(line);
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

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
        workspaceContainer.innerHTML = '<p class="empty-text">Click a block above to add it here...</p>';
        stepIndex = 0;
    });

    // --- Init ---
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
            workspaceContainer.innerHTML = '<p class="empty-text">Click a block above to add it here...</p>';
            stepIndex = 0;
            document.querySelectorAll('.workspace-block').forEach(b => b.classList.remove('executing'));
        });
    });

    renderPalette();
    initSidebarToggle();
    initPaletteToggle();
    initBlocksPanelResize();
    initMainPanelResize();
});
