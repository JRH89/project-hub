const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    getProjects: () => ipcRenderer.invoke('get-projects'),
    saveProject: (project) => ipcRenderer.invoke('save-project', project),
    saveProjects: (projects) => ipcRenderer.invoke('save-projects', projects),
    scanDirectory: (path) => ipcRenderer.invoke('scan-directory', path),
    openFile: (path) => ipcRenderer.invoke('open-file', path),
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    getIndexedFiles: () => ipcRenderer.invoke('get-indexed-files'),
    saveIndexedFiles: (files) => ipcRenderer.invoke('save-indexed-files', files),
    showContextMenu: (item) => ipcRenderer.invoke('show-context-menu', item),
    onRemoveItem: (callback) => ipcRenderer.on('remove-item', (event, path) => callback(path)),
    runCommand: (command, cwd) => ipcRenderer.invoke('run-command', command, cwd),
    minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
    closeWindow: () => ipcRenderer.invoke('close-window'),
    
    // Update-related methods
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    downloadUpdate: () => ipcRenderer.invoke('download-update'),
    installUpdate: () => ipcRenderer.invoke('install-update'),
    getAutoUpdateSetting: () => ipcRenderer.invoke('get-auto-update-setting'),
    setAutoUpdateSetting: (enabled) => ipcRenderer.invoke('set-auto-update-setting', enabled),
    
    // Update event listeners
    onUpdateAvailable: (callback) => ipcRenderer.on('update-available', (event, info) => callback(info)),
    onUpdateProgress: (callback) => ipcRenderer.on('update-progress', (event, progress) => callback(progress)),
    onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', (event, info) => callback(info)),
});
