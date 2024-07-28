const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  dronex: () => process.env.VERSION,
  environment: () => process.env.NODE_ENV,
  version: () => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('app_version');
      ipcRenderer.once('app_version', (event, arg) => {
        if (arg.version) {
          resolve(arg.version);
        } else {
          reject('Version not found');
        }
      });
    });
  },
  // global function to renderer ping() then return string to main process
  // note we wrap call in a helper function. Never expose the entire ipcRenderer via preload
  init: () => ipcRenderer.invoke('init')
})

contextBridge.exposeInMainWorld('darkMode', {
  toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
  system: () => ipcRenderer.invoke('dark-mode:system')
})

contextBridge.exposeInMainWorld('network', {
  checkInternetConnection: async () => {
    try {
      const response = await fetch('https://xevnet.au', { method: 'HEAD', mode: 'no-cors' });
      return response.ok || response.type === 'opaque';
    } catch (error) {
      return false;
    }
  }
});

contextBridge.exposeInMainWorld('electron', {
  navigateToAbout: () => ipcRenderer.send('navigate-to-about'),
  navigateToHome: () => ipcRenderer.send('navigate-to-home'),
  navigateToSettings: () => ipcRenderer.send('navigate-to-settings')
});

ipcRenderer.on('navigate-to-about', () => {
  if (!window.location.href.endsWith('about.html')) {
    window.location.href = '../assets/html/about.html';
  }
});

ipcRenderer.on('navigate-to-home', () => {
  if (!window.location.href.endsWith('index.html')) {
    window.location.href = '../index.html';
  }
});

ipcRenderer.on('navigate-to-settings', () => {
  if (!window.location.href.endsWith('settings.html')) {
    window.location.href = '../assets/html/settings.html';
  }
});