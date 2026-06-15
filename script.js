document.addEventListener('DOMContentLoaded', () => {
    // --- UI Elements ---
    const navItems = document.querySelectorAll('.nav-menu li');
    const visualizerPlaceholderContainer = document.querySelector('.canvas-placeholder');
    const visualizerPlaceholderText = document.querySelector('.canvas-placeholder p');
    const visualizerContainer = document.getElementById('visualizer-container');
    
    const paletteContainer = document.getElementById('block-palette');
    const workspaceContainer = document.getElementById('script-workspace');
    
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
    }

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
                'cpp': '// Bubble sort implementation\nvoid bubbleSort() {\n    if(!head) return;\n    bool swapped;\n    Node* ptr1;\n    Node* lptr = nullptr;\n    do {\n        swapped = false;\n        ptr1 = head;\n        while (ptr1->next != lptr) {\n            if (ptr1->data > ptr1->next->data) {\n                swap(ptr1->data, ptr1->next->data);\n                swapped = true;\n            }\n            ptr1 = ptr1->next;\n        }\n        lptr = ptr1;\n    } while (swapped);\n}',
                'python': '# Bubble sort\ndef sort(self):\n    if not self.head: return\n    swapped = True\n    while swapped:\n        swapped = False\n        current = self.head\n        while current.next:\n            if current.data > current.next.data:\n                current.data, current.next.data = current.next.data, current.data\n                swapped = True\n            current = current.next',
                'java': '// Bubble sort\nvoid sort() {\n    if(head == null) return;\n    boolean swapped;\n    Node current;\n    do {\n        swapped = false;\n        current = head;\n        while (current.next != null) {\n            if (current.data > current.next.data) {\n                int t = current.data;\n                current.data = current.next.data;\n                current.next.data = t;\n                swapped = true;\n            }\n            current = current.next;\n        }\n    } while (swapped);\n}',
                'javascript': '// Bubble sort\nsort() {\n    if(!this.head) return;\n    let swapped;\n    do {\n        swapped = false;\n        let current = this.head;\n        while (current.next) {\n            if (current.data > current.next.data) {\n                let t = current.data;\n                current.data = current.next.data;\n                current.next.data = t;\n                swapped = true;\n            }\n            current = current.next;\n        }\n    } while (swapped);\n}'
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
                    input.type = 'text';
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
                input.type = 'text';
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
    let noteLanguage = 'ua'; // default to Ukrainian

    window.toggleNoteLanguage = function() {
        noteLanguage = noteLanguage === 'ua' ? 'en' : 'ua';
        updateModalCode();
    };

    function getEducationalNoteHtml(progLang) {
        const langName = progLang === 'python' ? 'Python' : progLang === 'java' ? 'Java' : 'JavaScript';
        
        let textEN = `<strong>💡 Educational Note:</strong> ${langName} uses <em>object references</em> instead of explicit memory pointers (like in C++). However, the conceptual data structure (nodes linking to other nodes in memory) works exactly the same way. The arrows in our visualization perfectly represent these references!`;
        
        let textUA = `<strong>💡 Навчальна замітка:</strong> ${langName} використовує <em>посилання на об'єкти</em> замість явних вказівників на пам'ять (як у C++). Проте концептуально структура даних (вузли, що посилаються один на одного) працює абсолютно так само. Стрілочки у нашій візуалізації ідеально відображають ці посилання!`;

        const toggleText = noteLanguage === 'ua' ? 'EN' : 'UA';
        const content = noteLanguage === 'ua' ? textUA : textEN;

        return `
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>${content}</div>
                <button onclick="toggleNoteLanguage()" style="background:var(--panel-bg); border:1px solid var(--panel-border); color:var(--text-main); cursor:pointer; font-size:0.7rem; padding: 2px 6px; border-radius: 4px; flex-shrink:0; margin-left:15px;" title="Switch language / Перемкнути мову">${toggleText}</button>
            </div>
        `;
    }

    function updateModalCode() {
        if (!currentModalBlockId) return;
        const lang = modalLangSelect.value;
        
        // Show/hide pointer note for high-level languages
        if (lang === 'python' || lang === 'javascript' || lang === 'java') {
            languageNote.style.display = 'block';
            languageNote.innerHTML = getEducationalNoteHtml(lang);
        } else {
            languageNote.style.display = 'none';
        }

        let code = `// Implementation for ${currentModalBlockId} in ${currentStructure}\n// Coming soon...`;
        
        if (blockCodes[currentStructure] && blockCodes[currentStructure][currentModalBlockId] && blockCodes[currentStructure][currentModalBlockId][lang]) {
            code = blockCodes[currentStructure][currentModalBlockId][lang];
        } else if (currentStructure === 'doubly-linked-list' && blockCodes['singly-linked-list'][currentModalBlockId]) {
             code = `// Similar to Singly Linked List, but update prev pointers too.\n` + blockCodes['singly-linked-list'][currentModalBlockId][lang];
        }

        modalCodeSnippet.textContent = code;
    }

    closeModalBtn.addEventListener('click', () => modal.classList.remove('active'));
    modalLangSelect.addEventListener('change', updateModalCode);
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

        if (currentStructure.includes('list')) {
            // Render Nodes
            structureData.forEach((val, index) => {
                const wrapper = document.createElement('div');
                wrapper.className = 'node-wrapper';
                
                if (index === animatedIndex) {
                    wrapper.classList.add(animationClass);
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
            if (!currentStructure.includes('circular')) {
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
            }
        } else if (currentStructure.includes('graph')) {
            const graphContainer = document.createElement('div');
            graphContainer.className = 'graph-container';
            
            const n = structureData.vertices.length;
            const radius = 120;
            const center = { x: 300, y: 150 }; // approx center of visualizer
            
            const positions = {};
            
            // SVG for edges
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.className = 'graph-edges';
            svg.style.position = 'absolute';
            svg.style.top = '0';
            svg.style.left = '0';
            svg.style.width = '100%';
            svg.style.height = '100%';
            
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
                    line.setAttribute('x1', p1.x + 25);
                    line.setAttribute('y1', p1.y + 25);
                    line.setAttribute('x2', p2.x + 25);
                    line.setAttribute('y2', p2.y + 25);
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
            if (!isNaN(index) && index >= 0 && index <= structureData.length) {
                structureData.splice(index, 0, value);
                renderVisualizer(index, 'anim-enter');
                await sleep(700);
            }
        } else if (blockId === 'reverse') {
            if (structureData.length > 1) {
                const arrows = document.querySelectorAll('#visualizer-container .arrow');
                for(let i = 0; i < arrows.length; i++) {
                    arrows[i].style.transition = 'transform 0.4s ease';
                    arrows[i].style.transform = 'rotate(180deg)';
                    await sleep(400);
                    await checkPause();
                }
                await sleep(600); // Give user time to see the arrows flipped
                structureData.reverse();
                renderVisualizer();
            }
        } else if (blockId === 'bfs' || blockId === 'dfs') {
            if (!structureData.vertices || structureData.vertices.length === 0) return;
            let startNode = v1 || structureData.vertices[0];
            if (!structureData.vertices.includes(startNode)) {
                alert(`Vertex ${startNode} not found!`);
                return;
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
                            
                            currentNodes[j].classList.add('anim-swap-right');
                            currentNodes[j+1].classList.add('anim-swap-left');
                            
                            await sleep(800);
                            
                            let temp = structureData[j];
                            structureData[j] = structureData[j+1];
                            structureData[j+1] = temp;
                            
                            currentNodes[j].textContent = structureData[j];
                            currentNodes[j+1].textContent = structureData[j+1];
                            
                            currentNodes[j].classList.remove('anim-swap-right');
                            currentNodes[j+1].classList.remove('anim-swap-left');
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
});
