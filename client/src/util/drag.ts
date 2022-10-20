import {Vec2} from "@/util/math";

export interface DragOptions {
    el?: HTMLElement
    onDragStart?: (event: DragEvent) => void
    onMouseDown?: (event: DragEvent) => void
    onDrag?: (event: DragEvent) => void
    onDragEnd?: (event: DragEvent) => void
    onClick?: (event: DragEvent) => void
    scale?: number
    dragStartTolerance?: number

    getPosition?: (pos: Vec2) => Vec2
}

export class DragEvent {
    constructor(
        readonly evt: MouseEvent,
        readonly button: number,
        readonly start: Vec2,
        readonly current: Vec2,
        readonly delta: Vec2,
    ) {
    }

    get total() {
        return this.current.sub(this.start)
    }

    get leftMouseButton() {
        return this.button === 0
    }

    get rightMouseButton() {
        return this.button === 2
    }

    get shiftKey() {
        return this.evt.shiftKey
    }

    get ctrlKey() {
        return this.evt.ctrlKey
    }
}

function getPosition(evt: MouseEvent, scale: number, opts: DragOptions, el?: HTMLElement): Vec2 {
    if (opts.getPosition)
        return opts.getPosition(new Vec2(evt.clientX, evt.clientY))

    if (el) {
        const rect = el.getBoundingClientRect()
        return new Vec2(evt.clientX - rect.x, evt.clientY - rect.y).mulF(scale)
    }
    return new Vec2(evt.clientX, evt.clientY)
}

export function drag(evt: MouseEvent, opts: DragOptions): void {
    const scale = opts.scale ?? 1
    const startPosition = getPosition(evt, scale, opts, opts.el)
    let lastPosition = startPosition
    const button = evt.button
    let started = false
    const dragStartTolerance = opts.dragStartTolerance ?? 1

    if (opts.onMouseDown) {
        opts.onMouseDown(new DragEvent(
            evt,
            button,
            startPosition,
            startPosition,
            Vec2.zero()
        ))
    }

    function handleDrag(evt: MouseEvent) {
        let currentPosition = getPosition(evt, scale, opts, opts.el)

        if (!started && currentPosition.sub(startPosition).lengthSquared < (dragStartTolerance * dragStartTolerance)) {
            return
        }

        if (!started && opts.onDragStart) {
            opts.onDragStart(new DragEvent(
                evt,
                button,
                startPosition,
                currentPosition,
                Vec2.zero()
            ))
        }

        if (opts.onDrag) {
            const delta = currentPosition.sub(lastPosition)

            opts.onDrag(new DragEvent(
                evt,
                button,
                startPosition,
                currentPosition,
                delta
            ))
        }

        lastPosition = currentPosition
        started = true
    }

    function dragEnd(evt: MouseEvent) {
        if (evt.button === button) {

            if (!started && opts.onClick) {
                opts.onClick(new DragEvent(
                    evt,
                    button,
                    startPosition,
                    startPosition,
                    Vec2.zero(),
                ))
            }

            document.removeEventListener('mousemove', handleDrag)
            document.removeEventListener('mouseup', dragEnd)

            if (opts.onDragEnd && started) {
                const currentPosition = getPosition(evt, scale, opts, opts.el)
                const delta = currentPosition.sub(lastPosition)

                opts.onDragEnd(new DragEvent(
                    evt,
                    button,
                    startPosition,
                    currentPosition,
                    delta
                ))
            }
        }
    }

    document.addEventListener('mousemove', handleDrag)
    document.addEventListener('mouseup', dragEnd)
}