import { app, BrowserWindow, shell, session, ipcMain } from 'electron';
import { join } from 'path';
import { electronApp, is } from '@electron-toolkit/utils';
import { setupEnvironment } from './ElectronEnvironment';
import { setupProtocol } from './protocol';
import { loadOsuStableInfo } from './loadOsuStableInfo';
import { checkForUpdates } from './auto-update';

app.commandLine.appendSwitch ("disable-http-cache");

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: is.dev,
    fullscreen: true,
    simpleFullscreen: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      autoplayPolicy: 'no-user-gesture-required',
      backgroundThrottling: false,
      // devTools: false,
    },
  });

  mainWindow.on('ready-to-show', () => {
    if (!is.dev)
      mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  checkForUpdates(mainWindow);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  try {
    await session.defaultSession.loadExtension(join(process.cwd(), 'pixi-devtools'))
  } catch (e) {
    // silently fail
  }

  const osuStableInfo = await loadOsuStableInfo();

  await setupEnvironment(osuStableInfo);

  setupProtocol(osuStableInfo);

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.osucad');
  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.


