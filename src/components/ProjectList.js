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
        this.container.innerHTML = `
      <ul class="project-list">
        ${this.projects.map(p => `<li data-id="${p.id}">${p.name}</li>`).join('')}
      </ul>
    `;

        this.container.querySelectorAll('li').forEach(li => {
            li.addEventListener('click', () => {
                const project = this.projects.find(p => p.id === li.dataset.id);
                document.dispatchEvent(new CustomEvent('project-selected', { detail: project }));
                this.container.querySelectorAll('li').forEach(el => el.classList.remove('active'));
                li.classList.add('active');
            });
        });
    }

    async addProject() {
        const name = await this.promptModal.open('Enter Project Name:');
        if (name) {
            const newProject = { id: uuidv4(), name, files: [] };
            this.projects.push(newProject);
            await Store.saveProject(newProject);
            this.render();
        }
    }
}
