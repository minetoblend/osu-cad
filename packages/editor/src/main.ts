import { WebGameHost } from 'osucad-framework';
import { OsucadGame } from './OsucadGame';

import { EditorContext } from './editor/context/EditorContext';
import './style.css';

function isElectron() {
  if (
    typeof window !== 'undefined' &&
    typeof window.process === 'object' &&
    'type' in window.process &&
    window.process.type === 'renderer'
  ) {
    return true;
  }

  if (
    typeof process !== 'undefined' &&
    typeof process.versions === 'object' &&
    !!process.versions.electron
  ) {
    return true;
  }

  if (
    typeof navigator === 'object' &&
    typeof navigator.userAgent === 'string' &&
    navigator.userAgent.indexOf('Electron') >= 0
  ) {
    return true;
  }

  return false;
}

const host = new WebGameHost('osucad', {
  friendlyGameName: 'osucad',
});

let context: EditorContext;

if (isElectron()) {
  const { ElectronEditorContext } = await import(
    './editor/context/ElectronEditorContext'
  );
  context = new ElectronEditorContext(
    'C:/Users/minet/AppData/Local/osu!/Songs/1851103 twenty one pilots - Heathens (Magnetude Bootleg)/twenty one pilots - Heathens (Magnetude Bootleg) (funny) [Marathon].osu',
  );
} else {
  const { DummyEditorContext } = await import(
    './editor/context/DummyEditorContext'
  );
  context = new DummyEditorContext();
}

host.run(new OsucadGame(context));
