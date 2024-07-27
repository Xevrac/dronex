const { app, BrowserWindow, ipcMain, autoUpdater, dialog } = require('electron/main');
const dotenv = require('dotenv');
const path = require('node:path');
const { updateElectronApp, UpdateSourceType } = require('update-electron-app')

// Fetch env var from .env
dotenv.config();

// Check for updates on launch and intervals
if (process.env.NODE_ENV === 'dev') { updateElectronApp({
  repo: 'Xevrac/dronex',
  updateInterval: '1 hour',
  notifyUser: true,
});
} 

autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: 'info',
    buttons: ['Restart', 'Later'],
    title: 'Application Update',
    message: process.platform === 'win32' ? releaseNotes : releaseName,
    detail:
      'A new version has been downloaded. Restart the application to apply the updates.'
  }

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall()
  })
})

autoUpdater.on('error', (message) => {
  console.error('There was a problem updating the application')
  console.error(message)
})

/////////////////////////////

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