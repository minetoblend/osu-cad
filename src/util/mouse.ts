import {Vec2} from "@/util/math";

export function getRelativePosition(evt: MouseEvent, relativeTo: HTMLElement) {
  const rect = relativeTo.getBoundingClientRect()
  return new Vec2(evt.clientX - rect.x, evt.clientY - rect.y)
}

export interface GlobalDragOptions {
  button?: number

  onDrag(evt: MouseEvent): void

  onDragEnd(evt: MouseEvent): void
}

export function startGlobalDragAction(relativeTo: HTMLElement, opts: GlobalDragOptions) {

  function onMouseMove(evt: MouseEvent) {
    if (opts.onDrag)
      opts.onDrag(evt)
  }

  function onMouseUp(evt: MouseEvent) {
    if (evt.button === (opts.button || 0)) {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      if (opts.onDragEnd)
        opts.onDragEnd(evt)
    }
  }

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)

}