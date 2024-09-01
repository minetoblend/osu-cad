import { BrowserWindow, app } from 'electron';

async function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    fullscreen: true,
    simpleFullscreen: true,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true,
      autoplayPolicy: 'no-user-gesture-required',
      webSecurity: false,
    },
  });

  // win.setMenu(null);

  win.once('ready-to-show', () => {
    win.show();
  });

  await win.loadURL('http://localhost:5173');
}

app.whenReady().then(createWindow);
