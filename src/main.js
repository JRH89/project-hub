import './style.css';
import { ProjectList } from './components/ProjectList.js';
import { FileList } from './components/FileList.js';
import { SearchModal } from './components/SearchModal.js';
import { PromptModal } from './components/PromptModal.js';
import { CLI } from './components/CLI.js';
import { UpdateNotification } from './components/UpdateNotification.js';

document.querySelector('#app').innerHTML = `
  <div class="title-bar">
    <div class="title-bar-left">
      <h1>Project Hub</h1>
    </div>
    <div class="title-bar-right">
      <button id="minimize-btn" class="window-btn">−</button>
      <button id="close-btn" class="window-btn close">×</button>
    </div>
  </div>
  <div class="app-container">
    <div class="sidebar">
      <div class="sidebar-header">
        <h1>Projects</h1>
        <button id="add-project-btn" class="icon-btn">+</button>
      </div>
      <div id="project-list"></div>
    </div>
    <div class="main-content">
      <div id="file-list"></div>
      <div id="cli-container"></div>
    </div>
  </div>
  <div id="search-modal-container"></div>
  <div id="prompt-modal-container"></div>
  <div id="update-notification-container"></div>
`;

const promptModal = new PromptModal(document.querySelector('#prompt-modal-container'));
const projectList = new ProjectList(document.querySelector('#project-list'), promptModal);
const fileList = new FileList(document.querySelector('#file-list'));
const searchModal = new SearchModal(document.querySelector('#search-modal-container'));
const cli = new CLI(document.querySelector('#cli-container'));

// Render update notification
const updateContainer = document.querySelector('#update-notification-container');
const updateNotification = new UpdateNotification(updateContainer);
window.updateNotification = updateNotification;

// Add project button handler
document.querySelector('#add-project-btn').addEventListener('click', () => {
  projectList.addProject();
});

// Window control handlers
document.querySelector('#minimize-btn').addEventListener('click', () => {
  window.api.minimizeWindow();
});

document.querySelector('#close-btn').addEventListener('click', () => {
  window.api.closeWindow();
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
