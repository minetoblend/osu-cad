import isElectron from 'is-electron';

export async function autodetectEditorEnvironment() {
  if (isElectron()) {
    const { ElectronEditorEnvironment } = await import('./electron/ElectronEditorEnvironment');
    return new ElectronEditorEnvironment();
  }

  const { BrowserEditorEnvironment } = await import('./browser/BrowserEditorEnvironment');

  return new BrowserEditorEnvironment();
}
