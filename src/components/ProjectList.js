import { Store } from '../services/Store.js';
import { v4 as uuidv4 } from 'uuid';

export class ProjectList {
    constructor(container, promptModal, onSelectProject) {
        this.container = container;
        this.promptModal = promptModal;
        this.onSelectProject = onSelectProject;
        this.projects = [];
        this.init();
    }

    async init() {
        this.projects = await Store.getProjects();
        this.render();
    }

    render() {
        this.container.innerHTML = `
      <div class="project-list-header">
        <h2>Projects</h2>
        <button id="add-project-btn">+</button>
      </div>
      <ul class="project-list">
        ${this.projects.map(p => `<li data-id="${p.id}">${p.name}</li>`).join('')}
      </ul>
    `;

        this.container.querySelector('#add-project-btn').addEventListener('click', () => this.addProject());
        this.container.querySelectorAll('li').forEach(li => {
            li.addEventListener('click', () => {
                this.onSelectProject(this.projects.find(p => p.id === li.dataset.id));
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
