import { Store } from '../services/Store.js';
import { filterProjects } from '../services/ProjectFilter.js';
import { v4 as uuidv4 } from 'uuid';

export class ProjectList {
    constructor(container, promptModal) {
        this.container = container;
        this.promptModal = promptModal;
        this.projects = [];
        this.filterQuery = '';
        this.selectedProjectId = null;
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
        if (!this.filterInput) this.createFilterControls();
        const matches = filterProjects(this.projects, this.filterQuery);
        this.clearFilterButton.hidden = this.filterQuery.length === 0;
        this.results.replaceChildren();
        this.emptyState.hidden = matches.length > 0;
        this.emptyState.textContent = this.projects.length === 0
            ? 'No projects yet. Add a project to get started.'
            : 'No projects found';

        for (const [heading, entries] of [
            ['Favorites', matches.filter(project => project.favorite)],
            ['Projects', matches.filter(project => !project.favorite)],
        ]) {
            if (entries.length === 0) continue;
            const title = document.createElement('h2');
            title.className = 'section-header';
            title.textContent = heading;
            const list = document.createElement('ul');
            list.className = 'project-list';
            entries.forEach(project => list.appendChild(this.createProjectRow(project)));
            this.results.appendChild(title);
            this.results.appendChild(list);
        }
    }

    createFilterControls() {
        const controls = document.createElement('div');
        controls.className = 'project-filter-controls';
        const label = document.createElement('label');
        label.textContent = 'Filter projects';
        label.setAttribute('for', 'project-filter');
        this.filterInput = document.createElement('input');
        this.filterInput.id = 'project-filter';
        this.filterInput.type = 'search';
        this.filterInput.placeholder = 'Filter projects…';
        this.filterInput.setAttribute('aria-label', 'Filter projects');
        this.filterInput.addEventListener('input', () => {
            this.filterQuery = this.filterInput.value;
            this.render();
        });
        this.filterInput.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                event.preventDefault();
                this.clearFilter();
            }
        });
        this.clearFilterButton = document.createElement('button');
        this.clearFilterButton.type = 'button';
        this.clearFilterButton.textContent = 'Clear filter';
        this.clearFilterButton.addEventListener('click', () => this.clearFilter());
        controls.appendChild(label);
        controls.appendChild(this.filterInput);
        controls.appendChild(this.clearFilterButton);
        this.results = document.createElement('div');
        this.results.className = 'project-filter-results';
        this.emptyState = document.createElement('p');
        this.emptyState.className = 'project-filter-empty';
        this.emptyState.setAttribute('role', 'status');
        // Keep the input mounted while results change so typing retains focus and caret.
        this.container.replaceChildren(controls, this.results, this.emptyState);
    }

    clearFilter() {
        this.filterQuery = '';
        this.filterInput.value = '';
        this.render();
        this.filterInput.focus();
    }

    createProjectRow(project) {
        const row = document.createElement('li');
        row.dataset.id = project.id;
        if (project.favorite) row.classList.add('favorite');
        if (project.id === this.selectedProjectId) row.classList.add('active');
        const star = document.createElement('span');
        star.className = 'star';
        star.textContent = project.favorite ? '⭐' : '☆';
        const name = document.createElement('span');
        name.className = 'name';
        // Stored project names are user data, never markup.
        name.textContent = typeof project.name === 'string' ? project.name : '';
        row.appendChild(star);
        row.appendChild(name);
        row.addEventListener('click', event => {
            if (event.target.classList.contains('star')) return this.toggleFavorite(project.id);
            this.selectedProjectId = project.id;
            this.container.querySelectorAll('li[data-id]').forEach(item => item.classList.remove('active'));
            row.classList.add('active');
            document.dispatchEvent(new CustomEvent('project-selected', { detail: project }));
        });
        row.addEventListener('contextmenu', event => {
            event.preventDefault();
            this.showContextMenu(event, project.id);
        });
        return row;
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
