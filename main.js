const { app, BrowserWindow, ipcMain } = require('electron/main');
const dotenv = require('dotenv');
const path = require('node:path');
// const { updateElectronApp, UpdateSourceType } = require('update-electron-app')

// Fetch env var from .env
dotenv.config();

// updateElectronApp({
//   updateInterval: '5 minutes',
//   logger: require('electron-log')
// })

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
        preload: path.join(__dirname, 'scripts/preload.js')
      }
  });

  win.loadFile('assets/index.html')

  // Check if env is dev or prod
  if (process.env.NODE_ENV === 'dev') {
    win.webContents.openDevTools({
        title: "Developer Tools"
    });
  }
};

app.whenReady().then(() => {
  ipcMain.handle('init', () => 'Dronex initialized, backend communication established.')

  ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', { version: app.getVersion() });
  });

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});