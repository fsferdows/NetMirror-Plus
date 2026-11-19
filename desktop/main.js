const { app, BrowserWindow, shell, ipcMain, Menu } = require('electron');
const path = require('path');

const APP_URL = 'https://netmirror-plus.vercel.app/?source=desktop';

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#060a14',
    title: 'MovieBox Plus',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      sandbox: true,
    },
    icon: path.join(__dirname, 'icon.png'),
    show: false,
  });

  mainWindow.loadURL(APP_URL);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Block popup ads and unwanted new windows; keep user inside the cinema player
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (
      url.includes('netmirror-plus.vercel.app') ||
      url.includes('vidlink.pro') ||
      url.includes('smashystream.com')
    ) {
      return { action: 'allow' };
    }
    // Open external browser for non-media links (e.g. GitHub or email)
    if (url.startsWith('https://github.com') || url.startsWith('mailto:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Window control IPC
  ipcMain.on('window-minimize', () => mainWindow?.minimize());
  ipcMain.on('window-maximize', () => {
    if (mainWindow?.isMaximized()) mainWindow.unmaximize();
    else mainWindow?.maximize();
  });
  ipcMain.on('window-close', () => mainWindow?.close());
  ipcMain.on('window-toggle-fullscreen', () => {
    mainWindow?.setFullScreen(!mainWindow.isFullScreen());
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// macOS dock and window lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
