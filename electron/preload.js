const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('kioskAPI', {
  silentPrint: () => ipcRenderer.invoke('silent-print'),
  exitApp: () => ipcRenderer.invoke('exit-app'),
});
