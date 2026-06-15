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
    let isPaused = false;
    let stepIndex = 0;

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
            { id: 'sort', label: 'sort', type: 'action', hasSelect: true, options: ['Bubble Sort'] }
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
            // Render HEAD
            const headWrapper = document.createElement('div');
            headWrapper.className = 'node-wrapper';
            const headNode = document.createElement('div');
            headNode.className = 'node nullptr';
            headNode.textContent = 'HEAD';
            headNode.style.borderRadius = '8px';
            headWrapper.appendChild(headNode);
            
            const headArrow = document.createElement('div');
            headArrow.className = 'arrow';
            if (currentStructure === 'doubly-linked-list') headArrow.classList.add('double');
            headWrapper.appendChild(headArrow);
            visualizerContainer.appendChild(headWrapper);

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
            const endWrapper = document.createElement('div');
            endWrapper.className = 'node-wrapper';
            const endNode = document.createElement('div');
            endNode.className = 'node nullptr';
            
            if (currentStructure.includes('circular')) {
                endNode.textContent = 'HEAD';
                endNode.style.borderRadius = '8px';
            } else {
                endNode.textContent = 'NULL';
                endNode.style.border = '2px dashed var(--text-muted)';
                endNode.style.background = 'transparent';
                endNode.style.color = 'var(--text-muted)';
            }
            
            endWrapper.appendChild(endNode);
            visualizerContainer.appendChild(endWrapper);
            
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
                if (!node) return null;
                const wrapper = document.createElement('div');
                wrapper.className = 'tree-node-wrapper';
                
                const el = document.createElement('div');
                el.className = 'node';
                el.textContent = node.val;
                wrapper.appendChild(el);
                
                if (node.left || node.right) {
                    const children = document.createElement('div');
                    children.className = 'tree-children';
                    
                    const leftChild = buildTreeDOM(node.left);
                    const rightChild = buildTreeDOM(node.right);
                    
                    if (leftChild) children.appendChild(leftChild);
                    else {
                        const empty = document.createElement('div');
                        empty.className = 'tree-node-wrapper empty';
                        empty.style.width = '50px';
                        children.appendChild(empty);
                    }
                    
                    if (rightChild) children.appendChild(rightChild);
                    else {
                        const empty = document.createElement('div');
                        empty.className = 'tree-node-wrapper empty';
                        empty.style.width = '50px';
                        children.appendChild(empty);
                    }
                    
                    wrapper.appendChild(children);
                }
                return wrapper;
            }
            
            treeContainer.appendChild(buildTreeDOM(structureData));
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
                structureData.reverse();
                renderVisualizer();
            }
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
        } else if (blockId === 'print') {
            for (let i = 0; i < nodes.length; i++) {
                nodes[i].classList.add('anim-highlight-yellow');
                await sleep(700);
                nodes[i].classList.remove('anim-highlight-yellow');
            }
        } else if (blockId === 'sort') {
            // Bubble Sort Visualization
            let n = structureData.length;
            for (let i = 0; i < n - 1; i++) {
                for (let j = 0; j < n - i - 1; j++) {
                    const currentNodes = document.querySelectorAll('#visualizer-container .node:not(.nullptr)');
                    
                    // Highlight elements being compared
                    currentNodes[j].classList.add('anim-highlight-yellow');
                    currentNodes[j+1].classList.add('anim-highlight-yellow');
                    await sleep(700);
                    await checkPause();
                    
                    if (parseInt(structureData[j]) > parseInt(structureData[j+1])) {
                        // Flash green for swap and physical move
                        currentNodes[j].classList.remove('anim-highlight-yellow');
                        currentNodes[j+1].classList.remove('anim-highlight-yellow');
                        
                        currentNodes[j].classList.add('anim-swap-right');
                        currentNodes[j+1].classList.add('anim-swap-left');
                        
                        await sleep(800);
                        
                        // Swap data in array
                        let temp = structureData[j];
                        structureData[j] = structureData[j+1];
                        structureData[j+1] = temp;
                        
                        // Update text in DOM visually after animation finishes
                        currentNodes[j].textContent = structureData[j];
                        currentNodes[j+1].textContent = structureData[j+1];
                        
                        currentNodes[j].classList.remove('anim-swap-right');
                        currentNodes[j+1].classList.remove('anim-swap-left');
                    } else {
                        // Remove highlight if no swap
                        currentNodes[j].classList.remove('anim-highlight-yellow');
                        currentNodes[j+1].classList.remove('anim-highlight-yellow');
                    }
                }
            }
        }
    }

    async function runScript() {
        if (isExecuting) return;
        
        const blocks = document.querySelectorAll('.workspace-block');
        if (blocks.length === 0) return;

        isExecuting = true;
        btnRun.disabled = true;
        btnStep.disabled = true;
        stepIndex = 0; 

        for (let i = 0; i < blocks.length; i++) {
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
            await checkPause();
            await executeBlockAction(blockId, val);
            await sleep(400); 
        }

        blocks.forEach(b => b.classList.remove('executing'));
        isExecuting = false;
        btnRun.disabled = false;
        btnStep.disabled = false;
        stepIndex = 0;
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
        structureData = [];
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
