import { contextBridge } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
const api : ExposedAPI = {
  get stableDetected(): boolean {
    const result = electronAPI.ipcRenderer.sendSync('stableDetected');

    console.assert(typeof result === 'boolean');

    return result;
  },

  loadBeatmaps(): Promise<any> {
    return electronAPI.ipcRenderer.invoke('loadBeatmaps');
  },

  loadSkins(): Promise<any> {
    return electronAPI.ipcRenderer.invoke('loadSkins');
  }
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
