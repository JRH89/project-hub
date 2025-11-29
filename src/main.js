import './style.css';
import { ProjectList } from './components/ProjectList.js';
import { FileList } from './components/FileList.js';
import { SearchModal } from './components/SearchModal.js';
import { PromptModal } from './components/PromptModal.js';
import { CLI } from './components/CLI.js';

document.querySelector('#app').innerHTML = `
  <div class="sidebar">
    <div class="sidebar-header">
      <h1>Project Hub</h1>
      <button id="add-project-btn" class="icon-btn">+</button>
    </div>
    <div id="project-list"></div>
  </div>
  <div class="main-content">
    <div id="file-list"></div>
    <div id="cli-container"></div>
  </div>
  <div id="search-modal-container"></div>
  <div id="prompt-modal-container"></div>
`;

const promptModal = new PromptModal(document.querySelector('#prompt-modal-container'));
const projectList = new ProjectList(document.querySelector('#project-list'), promptModal);
const fileList = new FileList(document.querySelector('#file-list'));
const searchModal = new SearchModal(document.querySelector('#search-modal-container'));
const cli = new CLI(document.querySelector('#cli-container'));

// Add project button handler
document.querySelector('#add-project-btn').addEventListener('click', () => {
  projectList.addProject();
});

// Event Bus
document.addEventListener('project-selected', (e) => {
  fileList.setProject(e.detail);
  cli.setProject(e.detail);
});

document.addEventListener('project-updated', (e) => {
  projectList.refresh();
  fileList.setProject(e.detail);
  cli.setProject(e.detail);
});
