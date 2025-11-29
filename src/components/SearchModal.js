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

        // Initialize search with a default scan if needed, or wait for user input
        // For now, let's just show the UI. 
        // In a real app, we might scan a default dir or let user pick.
        // For this demo, let's scan the User's Desktop or Documents as a demo source?
        // Or just ask user to pick a folder to scan?
        // Let's auto-scan the current project-hub folder for demo purposes if no files indexed.

        // Actually, let's just wait for user to type and maybe trigger a scan if empty?
        // Or add a "Scan Folder" button in the modal.
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
          <button id="scan-btn">Scan Dir</button>
        </div>
        <div class="search-results"></div>
        <div class="modal-footer">
          <button id="add-selected-btn">Add Selected</button>
        </div>
      </div>
    `;

        this.container.querySelector('.close-btn').addEventListener('click', () => this.close());
        this.container.querySelector('#scan-btn').addEventListener('click', () => this.scanDirectory());
        this.container.querySelector('#search-input').addEventListener('input', (e) => this.handleSearch(e.target.value));
        this.container.querySelector('#add-selected-btn').addEventListener('click', () => this.addSelected());
    }

    async scanDirectory() {
        const dirPath = await window.api.selectDirectory();
        if (dirPath) {
            this.container.querySelector('#scan-btn').textContent = 'Scanning...';
            const files = await window.api.scanDirectory(dirPath);
            Search.init(files);
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
        resultsContainer.innerHTML = this.results.map(file => `
      <div class="result-item">
        <input type="checkbox" data-path="${file.path}" ${this.selectedFiles.has(file.path) ? 'checked' : ''}>
        <span class="result-name">${file.name}</span>
        <span class="result-path">${file.path}</span>
      </div>
    `).join('');

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
            // Refresh file list (hacky way via global event or callback, but let's just reload page or re-fetch)
            // Better: dispatch event
            document.dispatchEvent(new CustomEvent('project-updated', { detail: this.project }));
            this.close();
        }
    }
}
