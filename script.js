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

    /**
     * Applies the currently selected language (English/Ukrainian) translations to all UI elements.
     */
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

    /**
     * Global helper to trigger language switching.
     * @param {string} lang - The language code (e.g., "en", "uk").
     */
    window.setLang = function (lang) {
        if (lang === 'en') {
            document.getElementById('lang-en').click();
        } else {
            document.getElementById('lang-uk').click();
        }
    };

    /**
     * Transitions the UI from the home page to the main visualizer interface.
     */
    window.startVisualizer = function () {
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

    /**
     * Transitions the UI from the visualizer back to the home page.
     */
    window.goHome = function () {
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
    /**
     * Initializes event listeners for opening and closing the left sidebar.
     */
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
    /**
     * Initializes event listeners for toggling the block palette column.
     */
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

    // --- Blocks Panel Resize ---
    /**
     * Sets up draggable resizing functionality for the blocks palette.
     */
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
    /**
     * Sets up draggable resizing functionality between the script workspace and the visualization canvas.
     */
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

    // --- Canvas Zoom & Pan ---
    let zoomLevel = 1;
    let panX = 0;
    let panY = 0;
    let isDraggingCanvas = false;
    let startPanX = 0;
    let startPanY = 0;

    /**
     * Applies CSS pan and zoom transformations to the visualizer container.
     */
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

    /**
     * Resets pan and zoom levels to default and triggers a re-render of the visualizer.
     */
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
            }
        }
    };

    // --- Render Palette ---
    /**
     * Determines the block category based on the active data structure.
     * @param {string} struct - The data structure identifier.
     * @returns {string} The block category ("linked-list", "graph", "tree").
     */
    function getCategory(struct) {
        if (struct.includes('list')) return 'linked-list';
        if (struct.includes('graph')) return 'graph';
        if (struct.includes('tree')) return 'tree';
        return 'linked-list';
    }

    /**
     * Renders the available blocks into the palette based on the current category.
     */
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

    /**
     * Adds a selected block from the palette into the active script workspace.
     * @param {Object} blockDef - The definition of the block to add.
     * @param {Array|string} defaultVals - Default values for the block inputs.
     * @param {boolean} [skipSave=false] - Whether to skip saving the script.
     */
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

    // --- Modal Logic ---
    let currentModalBlockId = null;

    /**
     * Opens a modal displaying educational code snippets for a specific block action.
     * @param {string} blockId - The identifier of the block.
     */
    function openModal(blockId) {
        currentModalBlockId = blockId;
        modalTitle.textContent = `Code: ${blockId}()`;
        updateModalCode();
        modal.classList.add('active');
    }

    const languageNote = document.getElementById('language-note');
    const modalDescription = document.getElementById('modal-description');

    /**
     * Generates localized educational HTML content comparing memory pointers and object references.
     * @param {string} progLang - The selected programming language.
     * @returns {string} HTML content for the educational note.
     */
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

    /**
     * Updates the code snippet inside the modal based on the user's selected language and algorithm.
     */
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

    /**
     * Retrieves localized educational descriptions for algorithms.
     * @param {string} blockId - The block identifier (e.g., "sort").
     * @param {string} algo - The specific algorithm name.
     * @returns {string} Localized HTML description.
     */
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
            'add_vertex': 'Adds a new vertex to the graph. Time Complexity: O(1).',
            'add_edge': 'Adds a directed or undirected edge between two vertices. Time Complexity: O(1) for adjacency list.',
            'bfs': 'Breadth-First Search. Explores the graph layer by layer using a Queue. Time Complexity: O(V + E).',
            'dfs': 'Depth-First Search. Explores as far as possible along each branch before backtracking using a Stack (or recursion). Time Complexity: O(V + E).',
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
            'add_vertex': 'Додає нову вершину до графа. Часова складність: O(1).',
            'add_edge': 'Додає орієнтоване або неорієнтоване ребро між двома вершинами. Часова складність: O(1) (для списків суміжності).',
            'bfs': 'Пошук в ширину. Обходить граф рівень за рівнем за допомогою Черги. Часова складність: O(V + E).',
            'dfs': 'Пошук в глибину. Йде вглиб графа настільки далеко, наскільки це можливо (за допомогою Стека або рекурсії). Часова складність: O(V + E).',
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

    // --- Visualization Logic ---
    /**
     * Main rendering loop that updates DOM nodes based on current structure data and applies animations.
     * @param {number} animatedIndex - Index of the node to animate (default -1).
     * @param {string} animationClass - CSS class for the animation.
     */
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
                positions.push({ x, y });

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
                const dist = Math.sqrt(dx * dx + dy * dy);
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
                    const dist = Math.sqrt(dx * dx + dy * dy);

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

            /**
             * Recursively builds the DOM structure needed to visualize tree-based data structures.
             * @param {Object} node - The tree node to build DOM for.
             * @returns {HTMLElement} The created DOM element.
             */
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

    let animationSpeedMultiplier = 1.0;
    
    document.getElementById('speed-slider').addEventListener('input', (e) => {
        animationSpeedMultiplier = parseFloat(e.target.value);
        document.getElementById('speed-label').textContent = `Speed: ${animationSpeedMultiplier}x`;
    });

    /**
     * Utility function that returns a Promise to pause execution.
     * @param {number} ms - Milliseconds to sleep.
     * @returns {Promise} A promise that resolves after the specified time.
     */
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms / animationSpeedMultiplier));
    }

    /**
     * Asynchronously halts execution of script steps while the isPaused state is true.
     */
    async function checkPause() {
        while (isPaused) {
            await sleep(100);
        }
    }

    /**
     * Executes the logical action of a given block on the underlying structure data.
     * @param {string} blockId - The identifier of the action to execute.
     * @param {number|string} val - The input value associated with the action.
     */
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
                    for (let i = 0; i < arrows.length; i++) {
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

            structureData.edges.push({ u: v1, v: v2 });
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
                /**
                 * Internal helper implementing the Quick Sort algorithm logic.
                 * @param {Array} arr - Array to sort.
                 * @param {number} low - Starting index.
                 * @param {number} high - Ending index.
                 */
                async function quickSortLogic(arr, low, high) {
                    if (low < high) {
                        let pi = await partition(arr, low, high);
                        await quickSortLogic(arr, low, pi - 1);
                        await quickSortLogic(arr, pi + 1, high);
                    }
                }
                /**
                 * Internal helper partition function used by Quick Sort.
                 * @param {Array} arr - Array to partition.
                 * @param {number} low - Starting index.
                 * @param {number} high - Ending index.
                 * @returns {Promise<number>} The partition index.
                 */
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

                    let temp = arr[i + 1];
                    arr[i + 1] = arr[high];
                    arr[high] = temp;

                    nodes[i + 1].textContent = arr[i + 1];
                    nodes[high].textContent = arr[high];

                    nodes[high].style.borderColor = '';
                    nodes[i + 1].style.backgroundColor = '#10b981';
                    await sleep(400);
                    nodes[i + 1].style.backgroundColor = '';

                    return i + 1;
                }
                await quickSortLogic(structureData, 0, n - 1);
            } else {
                // Bubble Sort Visualization
                for (let i = 0; i < n - 1; i++) {
                    for (let j = 0; j < n - i - 1; j++) {
                        const currentNodes = document.querySelectorAll('#visualizer-container .node:not(.nullptr)');

                        currentNodes[j].classList.add('anim-highlight-yellow');
                        currentNodes[j + 1].classList.add('anim-highlight-yellow');
                        await sleep(700);
                        await checkPause();

                        if (parseInt(structureData[j]) > parseInt(structureData[j + 1])) {
                            currentNodes[j].classList.remove('anim-highlight-yellow');
                            currentNodes[j + 1].classList.remove('anim-highlight-yellow');

                            const isCircular = currentStructure === 'circular-linked-list';
                            if (!isCircular) {
                                currentNodes[j].classList.add('anim-swap-right');
                                currentNodes[j + 1].classList.add('anim-swap-left');
                            }

                            await sleep(800);

                            let temp = structureData[j];
                            structureData[j] = structureData[j + 1];
                            structureData[j + 1] = temp;

                            currentNodes[j].textContent = structureData[j];
                            currentNodes[j + 1].textContent = structureData[j + 1];

                            if (!isCircular) {
                                currentNodes[j].classList.remove('anim-swap-right');
                                currentNodes[j + 1].classList.remove('anim-swap-left');
                            }
                        } else {
                            currentNodes[j].classList.remove('anim-highlight-yellow');
                            currentNodes[j + 1].classList.remove('anim-highlight-yellow');
                        }
                    }
                }
            }
        }
    }

    /**
     * Asynchronously executes all blocks present in the script workspace sequentially.
     */
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

    /**
     * Executes a single block from the script workspace, advancing the visualization step-by-step.
     */
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