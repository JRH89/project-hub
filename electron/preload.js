const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    getProjects: () => ipcRenderer.invoke('get-projects'),
    saveProject: (project) => ipcRenderer.invoke('save-project', project),
    scanDirectory: (path) => ipcRenderer.invoke('scan-directory', path),
    openFile: (path) => ipcRenderer.invoke('open-file', path),
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    getIndexedFiles: () => ipcRenderer.invoke('get-indexed-files'),
    saveIndexedFiles: (files) => ipcRenderer.invoke('save-indexed-files', files),
    showContextMenu: (item) => ipcRenderer.invoke('show-context-menu', item),
    onRemoveItem: (callback) => ipcRenderer.on('remove-item', (event, path) => callback(path)),
    runCommand: (command, cwd) => ipcRenderer.invoke('run-command', command, cwd),
});
