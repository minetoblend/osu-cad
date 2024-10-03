import { contextBridge } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
const api: ExposedAPI = {
  get stableDetected(): boolean {
    const result = electronAPI.ipcRenderer.sendSync('stableDetected');

    console.assert(typeof result === 'boolean');

    return result;
  },

  get osuPaths() {
    return electronAPI.ipcRenderer.sendSync('osuPaths');
  },

  loadBeatmaps(): Promise<any> {
    return electronAPI.ipcRenderer.invoke('loadBeatmaps');
  },

  loadSkins(): Promise<any> {
    return electronAPI.ipcRenderer.invoke('loadSkins');
  },

  saveBeatmap(directory: string,
              filename: string,
              content: string): Promise<any> {
    return electronAPI.ipcRenderer.invoke('saveBeatmap', directory, filename, content);
  },

  checkForUpdates() {
    electronAPI.ipcRenderer.send('checkForUpdates')
  },

  onUpdateAvailable(fn: () => void) {
    return electronAPI.ipcRenderer.on('updateAvailable', fn)
  },

  onUpdateDownloadProgress(fn: (percent: number) => void) {
    return electronAPI.ipcRenderer.on('updateDownloadProgress', (_, progress) => fn(progress))
  },

  onUpdateDownloadComplete(fn: () => void) {
    return electronAPI.ipcRenderer.on('updateDownloadComplete', fn)
  },

  installUpdate() {
    return electronAPI.ipcRenderer.send('installUpdate')
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
