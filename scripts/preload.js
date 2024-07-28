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