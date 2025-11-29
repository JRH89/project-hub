import { Search } from '../services/Search.js';
import { Store } from '../services/Store.js';

export class SearchModal {
    constructor(container) {
        this.container = container;
        this.project = null;
        this.isOpen = false;
        this.results = [];
        this.selectedFiles = new Set();

        this.render();
        this.bindEvents();

        // Load index immediately
        (async () => {
            const files = await Store.getIndexedFiles();
            if (files && files.length > 0) {
                Search.init(files);
                console.log('Index loaded:', files.length, 'files');
            } else {
                console.log('No indexed files found. Click "Quick Scan" to scan common folders.');
            }
        })();
    }

    bindEvents() {
        document.addEventListener('open-search-modal', (e) => {
            this.project = e.detail.project;
            this.open();
        });
    }

    async open() {
        this.isOpen = true;
        this.container.style.display = 'flex';
        this.container.querySelector('input').focus();
    }

    close() {
        this.isOpen = false;
        this.container.style.display = 'none';
        this.results = [];
        this.selectedFiles.clear();
        this.renderResults();
    }

    render() {
        this.container.className = 'modal-overlay';
        this.container.style.display = 'none';
        this.container.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Add Files to Project</h3>
          <button class="close-btn">&times;</button>
        </div>
        <div class="search-bar">
          <input type="text" placeholder="Search files..." id="search-input">
          <button id="quick-scan-btn">Quick Scan</button>
          <button id="scan-btn">Scan Dir</button>
        </div>
        <div class="search-results"></div>
        <div class="modal-footer">
          <button id="add-selected-btn">Add Selected</button>
        </div>
      </div>
    `;

        this.container.querySelector('.close-btn').addEventListener('click', () => this.close());
        this.container.querySelector('#quick-scan-btn').addEventListener('click', () => this.quickScan());
        this.container.querySelector('#scan-btn').addEventListener('click', () => this.scanDirectory());
        this.container.querySelector('#search-input').addEventListener('input', (e) => this.handleSearch(e.target.value));
        this.container.querySelector('#add-selected-btn').addEventListener('click', () => this.addSelected());
    }

    async quickScan() {
        this.container.querySelector('#quick-scan-btn').textContent = 'Scanning...';

        // Scan common user directories
        const userHome = 'C:\\Users\\Jared';
        const dirsToScan = [
            `${userHome}\\Desktop`,
            `${userHome}\\Documents`,
            `${userHome}\\Downloads`,
            `${userHome}\\Pictures`
        ];

        let allFiles = [];
        for (const dir of dirsToScan) {
            console.log('Scanning:', dir);
            const files = await window.api.scanDirectory(dir);
            allFiles = allFiles.concat(files);
        }

        Search.init(allFiles);
        await Store.saveIndexedFiles(allFiles);
        this.handleSearch(this.container.querySelector('#search-input').value);
        this.container.querySelector('#quick-scan-btn').textContent = 'Quick Scan';
    }

    async scanDirectory() {
        const dirPath = await window.api.selectDirectory();
        if (dirPath) {
            this.container.querySelector('#scan-btn').textContent = 'Scanning...';
            const files = await window.api.scanDirectory(dirPath);
            Search.init(files);
            await Store.saveIndexedFiles(files);
            this.handleSearch(this.container.querySelector('#search-input').value);
            this.container.querySelector('#scan-btn').textContent = 'Scan Dir';
        }
    }

    handleSearch(query) {
        if (!query) {
            this.results = [];
        } else {
            this.results = Search.search(query);
        }
        this.renderResults();
    }

    renderResults() {
        const resultsContainer = this.container.querySelector('.search-results');
        resultsContainer.innerHTML = this.results.map(item => {
            const icon = item.type === 'directory' ? '📁' : 'jq'; // Placeholder icon logic
            // Better icon logic:
            let displayIcon = '📄';
            if (item.type === 'directory') displayIcon = '📁';
            else if (item.name.endsWith('.blend')) displayIcon = '🧊';
            else if (item.name.endsWith('.js')) displayIcon = '📜';

            return `
      <div class="result-item">
        <input type="checkbox" data-path="${item.path}" ${this.selectedFiles.has(item.path) ? 'checked' : ''}>
        <span class="result-icon">${displayIcon}</span>
        <span class="result-name">${item.name}</span>
        <span class="result-path">${item.path}</span>
      </div>
    `}).join('');

        resultsContainer.querySelectorAll('input').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const file = this.results.find(r => r.path === e.target.dataset.path);
                if (e.target.checked) {
                    this.selectedFiles.add(file);
                } else {
                    this.selectedFiles.delete(file);
                }
            });
        });
    }

    async addSelected() {
        if (this.project && this.selectedFiles.size > 0) {
            this.project.files.push(...this.selectedFiles);
            await Store.saveProject(this.project);
            document.dispatchEvent(new CustomEvent('project-updated', { detail: this.project }));
            this.close();
        }
    }
}
