import { autoUpdater } from 'electron-updater';
import { BrowserWindow, ipcMain } from 'electron';
import log from 'electron-log'

autoUpdater.logger = log


export function checkForUpdates(win: BrowserWindow) {
  autoUpdater.on('update-available', () => win.webContents.send('updateAvailable'))
  autoUpdater.on('download-progress', (progress) => win.webContents.send('updateDownloadProgress', progress.percent))
  autoUpdater.on('update-downloaded', () => win.webContents.send('updateDownloadComplete'))


  ipcMain.on('checkForUpdates', () => autoUpdater.checkForUpdatesAndNotify())
  ipcMain.once('installUpdate', () => autoUpdater.quitAndInstall(false, true))
}
