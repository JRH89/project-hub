const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    getProjects: () => ipcRenderer.invoke('get-projects'),
    saveProject: (project) => ipcRenderer.invoke('save-project', project),
    scanDirectory: (path) => ipcRenderer.invoke('scan-directory', path),
    openFile: (path) => ipcRenderer.invoke('open-file', path),
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
});
