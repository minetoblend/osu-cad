export function onEditorKeyDown(handler: (event: KeyboardEvent) => void): void {
  useEventListener('keydown', (event) => {
    if (!(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) {
      handler(event)
    }
  })
}

export function onEditorKeyUp(handler: (event: KeyboardEvent) => void): void {
  useEventListener('keyup', (event) => {
    if (!(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) {
      handler(event)
    }
  })
}