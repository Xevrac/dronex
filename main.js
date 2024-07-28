const { app, BrowserWindow, ipcMain, nativeTheme, Notification, Menu, Tray, nativeImage } = require('electron');
const dotenv = require('dotenv');
const path = require('path');

// Fetch env var from .env
dotenv.config();

// Set the AppUserModelId if OS is Windows
if (process.platform === 'win32') {
    app.setAppUserModelId("dronex.system.notification");
}

const isMac = process.platform === 'darwin';

const template = [
  ...(isMac ? [{
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
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
        label: 'Home',
        click: () => {
          const focusedWindow = BrowserWindow.getFocusedWindow();
          if (focusedWindow) {
            focusedWindow.webContents.send('navigate-to-home');
          }
        }
      },
      {
        label: 'Settings',
        click: () => {
          const focusedWindow = BrowserWindow.getFocusedWindow();
          if (focusedWindow) {
            focusedWindow.webContents.send('navigate-to-settings');
          }
        },
        enabled: false
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
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'About',
        click: () => {
          const focusedWindow = BrowserWindow.getFocusedWindow();
          if (focusedWindow) {
            focusedWindow.webContents.send('navigate-to-about');
          }
        }
      }
    ]
  }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        icon: 'assets/img/logo.ico',
        webPreferences: {
            preload: path.join(__dirname, 'scripts/preload.js'),
            nodeIntegration: true,
            contextIsolation: true
        },
    });

    win.loadFile('assets/index.html');

    if (process.env.NODE_ENV === 'dev') {
        win.webContents.openDevTools({
            title: "Developer Tools"
        });
    }

    ipcMain.handle('dark-mode:toggle', () => {
        if (nativeTheme.shouldUseDarkColors) {
            nativeTheme.themeSource = 'light'
        } else {
            nativeTheme.themeSource = 'dark'
        }
        return nativeTheme.shouldUseDarkColors
    });

    ipcMain.handle('dark-mode:system', () => {
        nativeTheme.themeSource = 'system'
    });
};

ipcMain.on('display-app-menu', (e, args) => {
    if (isWindows && mainWindow) {
        menu.popup({
            window: mainWindow,
            x: args.x,
            y: args.y
        });
    }
});

function showNotification() {
    new Notification({
        title: 'Dronex Status',
        body: 'Dronex has loaded successfully.',
        icon: 'assets/img/logo.ico'
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

    let tray;

    app.whenReady().then(() => {
        const icon = nativeImage.createFromPath('assets/img/logo.ico');
        tray = new Tray(icon);

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
        tray.setTitle('This is my title');
        tray.setContextMenu(contextMenu);
    });
}).then(showNotification);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
