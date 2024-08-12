const { contextBridge, ipcRenderer, shell } = require('electron')
const path = require('path');
const fs = require('fs');

contextBridge.exposeInMainWorld('api', {
  loadSidebar: () => ipcRenderer.invoke('load-sidebar'),
  getUsername: async () => {
    return await ipcRenderer.invoke('get-username');
  }
});

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  dronex: () => process.env.VERSION,
  environment: () => process.env.NODE_ENV,
  getCurrentYear: () => ipcRenderer.invoke('get-current-year'),
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
});

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
  navigateTo: (page) => ipcRenderer.send('navigate', page),
  openExternal: (url) => {
    shell.openExternal(url);
  }
});

ipcRenderer.on('navigate', (event, page) => {
  const pages = {
    home: '../index.html'
  };
  if (pages[page]) {
    window.location.replace(`${pages[page]}?t=${new Date().getTime()}`);  
  }
});


