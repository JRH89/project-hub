export class FileList {
    constructor(container) {
        this.container = container;
        this.project = null;
    }

    setProject(project) {
        this.project = project;
        this.render();
    }

    render() {
        if (!this.project) {
            this.container.innerHTML = '<div class="empty-state">Select a project</div>';
            return;
        }

        this.container.innerHTML = `
      <div class="file-list-header">
        <h2>${this.project.name}</h2>
        <button id="add-file-btn">Add Files</button>
      </div>
      <div class="file-grid">
        ${this.project.files.map(f => `
          <div class="file-card" data-path="${f.path}">
            <div class="file-icon">📄</div>
            <div class="file-name">${f.name}</div>
            <div class="file-path">${f.path}</div>
          </div>
        `).join('')}
      </div>
    `;

        this.container.querySelector('#add-file-btn').addEventListener('click', () => {
            document.dispatchEvent(new CustomEvent('open-search-modal', { detail: { project: this.project } }));
        });

        this.container.querySelectorAll('.file-card').forEach(card => {
            card.addEventListener('click', () => {
                window.api.openFile(card.dataset.path);
            });
        });
    }
}
