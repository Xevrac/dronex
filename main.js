const { app, BrowserWindow, ipcMain, nativeTheme, screen, Notification, Menu, Tray, nativeImage } = require('electron');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Fetch env var from .env
dotenv.config();

ipcMain.handle('get-username', () => {
  return os.userInfo().username;
});

ipcMain.handle('get-current-year', () => {
  return new Date().getFullYear();
});

// Set the AppUserModelId if OS is Windows
if (process.platform === 'win32') {
    app.setAppUserModelId("dronex.system.notification");
}

const isMac = process.platform === 'darwin';
const isDev = process.env.NODE_ENV === 'dev';

const template = [
  ...(isMac ? [{
    label: app.name,
    submenu: [
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }] : []),
  {
    label: 'File',
    submenu: [
      {
        label: 'Return',
        click: () => navigate('home')
      },
      {
        type: 'separator'
      },
      {
        label: 'Restart',
        click: () => {
          app.relaunch();
          app.exit();
        }
      },
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  },
  ...(isDev ? [{
    label: 'Dev',
    submenu: [
      {
        label: 'Toggle DevTools',
        click: () => {
          const win = BrowserWindow.getFocusedWindow();
          if (win) {
            win.webContents.toggleDevTools();
          }
        }
      },
      {
        label: 'Show Extension Inspectors',
        click: () => {
          const win = BrowserWindow.getFocusedWindow();
          if (win) {
            win.webContents.executeJavaScript('console.log("Extension Inspectors")');
          }
        }
      }
    ]
  }] : []),
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' }
    ]
  }
];

function navigate(page) {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    const pages = {
      home: path.join(__dirname, 'assets/html/index.html')
    };
    if (pages[page]) {
      focusedWindow.loadFile(pages[page]);
    }
  }
}

ipcMain.on('navigate', (event, page) => {
  navigate(page);
});

ipcMain.handle('dark-mode:toggle', () => {
  if (nativeTheme.shouldUseDarkColors) {
    nativeTheme.themeSource = 'light';
  } else {
    nativeTheme.themeSource = 'dark';
  }
  return nativeTheme.shouldUseDarkColors;
});

ipcMain.handle('dark-mode:system', () => {
  nativeTheme.themeSource = 'system';
});

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

const createWindow = () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const win = new BrowserWindow({
    width: width,
    height: height,
    icon: path.join(__dirname, 'assets/img/logo.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'scripts/preload.js'),
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: false
    },
    maximizable: true,
    fullscreenable: false
  });

  win.loadFile(path.join(__dirname, 'assets/html/index.html'));

  win.maximize();

  if (isDev) {
    win.webContents.openDevTools({
      mode: 'detach',
      title: "Developer Tools"
    });
  }

  // Prevent default action for F12
  win.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12') {
      event.preventDefault();
    }
  });
};

function showNotification() {
  new Notification({
    title: 'Dronex Status',
    body: 'Dronex has loaded successfully.',
    icon: path.join(__dirname, 'assets/img/logo.ico')
  }).show();
}

app.whenReady().then(() => {
  ipcMain.handle('init', () => 'Dronex initialized, backend communication established.');

  ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', { version: app.getVersion() });
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  const version = app.getVersion();

  const icon = nativeImage.createFromPath(path.join(__dirname, 'assets/img/logo.ico'));
  const tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: `Dronex v${version}`,
      type: 'normal',
      enabled: false,
    },
    {
      type: 'separator'
    },
    {
      label: 'Focus',
      type: 'normal',
      click: () => {
        const win = BrowserWindow.getAllWindows()[0];
        if (win) {
          win.show();
          win.focus();
        }
      }
    },
    {
      label: 'Restart',
      type: 'normal',
      click: () => {
        app.relaunch();
        app.exit();
      }
    },
    {
      label: 'Exit',
      type: 'normal',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('This is my application');
  tray.setContextMenu(contextMenu);

}).then(showNotification);

ipcMain.handle('load-sidebar', () => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, 'assets/html/sidebar.html'), 'utf8', (err, data) => {
      if (err) {
        reject('Error loading sidebar HTML');
      } else {
        resolve(data);
      }
    });
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
