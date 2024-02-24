export function onEditorKeyDown(handler: (event: KeyboardEvent) => void): void {
  useEventListener('keydown', (event) => {
    if (!shouldIgnore(event)) {
      handler(event);
    }
  });
}

export function onEditorKeyUp(handler: (event: KeyboardEvent) => void): void {
  useEventListener('keyup', (event) => {
    if (!shouldIgnore(event)) {
      handler(event);
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
