import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import Store from 'electron-store';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const store = new Store();

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        titleBarStyle: 'hidden',
        backgroundColor: '#1e1e1e',
    });

    const isDev = process.env.NODE_ENV !== 'production' && !app.isPackaged;

    if (isDev) {
        win.loadURL('http://localhost:5173');
        win.webContents.openDevTools();
    } else {
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC Handlers
ipcMain.handle('get-projects', () => {
    return store.get('projects', []);
});

ipcMain.handle('save-project', (event, project) => {
    const projects = store.get('projects', []);
    const index = projects.findIndex(p => p.id === project.id);
    if (index !== -1) {
        projects[index] = project;
    } else {
        projects.push(project);
    }
    store.set('projects', projects);
    return true;
});

ipcMain.handle('scan-directory', async (event, dirPath) => {
    try {
        const fs = await import('fs/promises');
        // Simple recursive scan
        async function getFiles(dir) {
            const dirents = await fs.readdir(dir, { withFileTypes: true });
            const files = await Promise.all(dirents.map((dirent) => {
                const res = path.resolve(dir, dirent.name);
                if (dirent.isDirectory()) {
                    return getFiles(res);
                } else {
                    return { name: dirent.name, path: res };
                }
            }));
            return Array.prototype.concat(...files);
        }
        return await getFiles(dirPath);
    } catch (error) {
        console.error('Scan failed:', error);
        return [];
    }
});

ipcMain.handle('open-file', async (event, filePath) => {
    const { shell } = require('electron');
    await shell.openPath(filePath);
});

ipcMain.handle('select-directory', async () => {
    const { dialog } = require('electron');
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
    });
    if (result.canceled) {
        return null;
    } else {
        return result.filePaths[0];
    }
});
