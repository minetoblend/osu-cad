import isElectron from 'is-electron';

export async function autodetectEditorEnvironment() {
  if (isElectron()) {
    const { ElectronEditorEnvironment } = await import('../electron/ElectronEditorEnvironment');
    return new ElectronEditorEnvironment();
  }

  throw new Error('Currently not supported');
}
