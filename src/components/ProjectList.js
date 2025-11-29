import { Store } from '../services/Store.js';
import { v4 as uuidv4 } from 'uuid';

export class ProjectList {
    constructor(container, promptModal) {
        this.container = container;
        this.promptModal = promptModal;
        this.projects = [];
        this.init();
    }

    async init() {
        this.projects = await Store.getProjects();
        this.render();
    }

    async refresh() {
        this.projects = await Store.getProjects();
        this.render();
    }

    render() {
        const favorites = this.projects.filter(p => p.favorite);
        const regular = this.projects.filter(p => !p.favorite);
        
        this.container.innerHTML = `
      <ul class="project-list">
        ${favorites.length > 0 ? `
          <div class="section-header">Favorites</div>
          ${favorites.map(p => `
            <li data-id="${p.id}" class="favorite">
              <span class="star">⭐</span>
              <span class="name">${p.name}</span>
            </li>
          `).join('')}
        ` : ''}
        ${regular.length > 0 ? `
          <div class="section-header">Projects</div>
          ${regular.map(p => `
            <li data-id="${p.id}">
              <span class="star">☆</span>
              <span class="name">${p.name}</span>
            </li>
          `).join('')}
        ` : ''}
      </ul>
    `;

        this.container.querySelectorAll('li').forEach(li => {
            li.addEventListener('click', (e) => {
                if (e.target.classList.contains('star')) {
                    this.toggleFavorite(li.dataset.id);
                } else {
                    const project = this.projects.find(p => p.id === li.dataset.id);
                    document.dispatchEvent(new CustomEvent('project-selected', { detail: project }));
                    this.container.querySelectorAll('li').forEach(el => el.classList.remove('active'));
                    li.classList.add('active');
                }
            });

            li.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showContextMenu(e, li.dataset.id);
            });
        });
    }

    async addProject() {
        const name = await this.promptModal.open('Enter Project Name:');
        if (name) {
            const newProject = { id: uuidv4(), name, files: [], favorite: false };
            this.projects.push(newProject);
            await Store.saveProject(newProject);
            this.render();
        }
    }

    async toggleFavorite(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            project.favorite = !project.favorite;
            await Store.saveProject(project);
            this.render();
        }
    }

    showContextMenu(event, projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.innerHTML = `
            <div class="menu-item" data-action="favorite">
                ${project.favorite ? '⭐ Remove from Favorites' : '☆ Add to Favorites'}
            </div>
            <div class="menu-item" data-action="remove">🗑️ Remove Project</div>
        `;

        document.body.appendChild(menu);

        const rect = event.target.getBoundingClientRect();
        menu.style.left = `${rect.left}px`;
        menu.style.top = `${rect.bottom + 5}px`;

        menu.addEventListener('click', async (e) => {
            const action = e.target.dataset.action;
            if (action === 'favorite') {
                await this.toggleFavorite(projectId);
            } else if (action === 'remove') {
                await this.removeProject(projectId);
            }
            menu.remove();
        });

        document.addEventListener('click', () => menu.remove(), { once: true });
    }

    async removeProject(projectId) {
        const confirmed = await this.promptModal.open('Remove this project? (yes/no):');
        if (confirmed && confirmed.toLowerCase() === 'yes') {
            this.projects = this.projects.filter(p => p.id !== projectId);
            await Store.saveProjects(this.projects);
            this.render();
        }
    }
}
