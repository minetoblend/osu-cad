import { resolveShortcut, ShortcutId } from '@/editorOld/shortcuts';

export function onEditorKeyDown(
  handler: (event: KeyboardEvent, shortcut?: ShortcutId) => void,
): void {
  useEventListener('keydown', (event) => {
    if (!shouldIgnore(event)) {
      handler(event, resolveShortcut(event));
    }
  });
}

export function onEditorKeyUp(
  handler: (event: KeyboardEvent, shortcut?: ShortcutId) => void,
): void {
  useEventListener('keyup', (event) => {
    if (!shouldIgnore(event)) {
      handler(event, resolveShortcut(event));
    }
  });
}

function shouldIgnore(event: KeyboardEvent): boolean {
  if (
    event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLTextAreaElement
  ) {
    return true;
  }
  if (document.querySelector('.q-dialog')) return true;

  return false;
}
