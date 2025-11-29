import { Store } from '../services/Store.js';

export class FileList {
  constructor(container) {
    this.container = container;
    this.project = null;
    this.removeListenerSet = false;
  }

  setProject(project) {
    this.project = project;
    this.render();
  }

  render() {
    if (!this.project) {
      this.container.innerHTML = '<div class="empty-state">Select a project to view files</div>';
      return;
    }

    if (this.project.files.length === 0) {
      this.container.innerHTML = `
        <div class="header">
          <h2>${this.project.name}</h2>
          <button id="add-file-btn">Add Files</button>
        </div>
        <div class="empty-state">No files linked yet</div>
      `;
    } else {
      this.container.innerHTML = `
        <div class="header">
          <h2>${this.project.name}</h2>
          <button id="add-file-btn">Add Files</button>
        </div>
        <div class="file-grid">
          ${this.project.files.map(file => {
        let displayIcon = '📄';
        if (file.type === 'directory') displayIcon = '📁';
        else if (file.name.endsWith('.blend')) displayIcon = '🧊';
        else if (file.name.endsWith('.js')) displayIcon = '📜';
        else if (file.name.endsWith('.html')) displayIcon = '🌐';
        else if (file.name.endsWith('.css')) displayIcon = '🎨';

        return `
            <div class="file-card" data-path="${file.path}">
              <div class="file-icon">${displayIcon}</div>
              <div class="file-name">${file.name}</div>
              <div class="file-path">${file.path}</div>
            </div>
          `;
      }).join('')}
        </div>
      `;
    }

    const addBtn = this.container.querySelector('#add-file-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        document.dispatchEvent(new CustomEvent('open-search-modal', { detail: { project: this.project } }));
      });
    }

    this.container.querySelectorAll('.file-card').forEach(card => {
      card.addEventListener('click', () => {
        window.api.openFile(card.dataset.path);
      });
      card.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        window.api.showContextMenu({
          path: card.dataset.path,
          type: card.querySelector('.file-icon').textContent === '📁' ? 'directory' : 'file'
        });
      });
    });

    if (!this.removeListenerSet) {
      window.api.onRemoveItem(async (pathToRemove) => {
        if (this.project) {
          this.project.files = this.project.files.filter(f => f.path !== pathToRemove);
          await Store.saveProject(this.project);
          this.render();
        }
      });
      this.removeListenerSet = true;
    }
  }
}
