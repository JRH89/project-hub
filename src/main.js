import './style.css';
import { ProjectList } from './components/ProjectList.js';
import { FileList } from './components/FileList.js';
import { SearchModal } from './components/SearchModal.js';
import { PromptModal } from './components/PromptModal.js';

document.querySelector('#app').innerHTML = `
  <div id="sidebar"></div>
  <div id="main-content"></div>
  <div id="modal-container"></div>
  <div id="prompt-modal-container"></div>
`;

const sidebar = document.querySelector('#sidebar');
const mainContent = document.querySelector('#main-content');
const modalContainer = document.querySelector('#modal-container');
const promptModalContainer = document.querySelector('#prompt-modal-container');

const fileList = new FileList(mainContent);
const searchModal = new SearchModal(modalContainer);
const promptModal = new PromptModal(promptModalContainer);

const projectList = new ProjectList(sidebar, promptModal, (project) => {
  fileList.setProject(project);
});

document.addEventListener('project-updated', (e) => {
  const updatedProject = e.detail;
  fileList.setProject(updatedProject);
  // Also update project list if name changed, or just re-render
  // For now, we just need to update the file list view
});
