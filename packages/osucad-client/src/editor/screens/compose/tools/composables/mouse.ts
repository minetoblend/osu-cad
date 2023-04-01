import {useEventListener, useMouseInElement} from "@vueuse/core";
import {computed, Ref} from "vue";
import {getToolContext} from "../defineTool";
import {Vec2} from "@osucad/common";

export function useViewportMousePos() {
  const ctx = getToolContext();

  const { elementX, elementY } = useMouseInElement(ctx.canvas);

  return computed<Vec2>(() => {
    const { x, y } = ctx.viewportContainer.toLocal({
      x: elementX.value,
      y: elementY.value,
    });

    return { x, y };
  });
}

export type BeginDragFunction = (
  onDrag: (evt: ViewportMouseEvent) => void,
  onEnd?: (evt: ViewportMouseEvent) => void
) => void;

export function onViewportMouseDown(
  listener: (evt: ViewportMouseEvent, beginDrag: BeginDragFunction) => void
): void;
export function onViewportMouseDown(
  options: ViewportMouseDownOptions,
  listener: (evt: ViewportMouseEvent, beginDrag: BeginDragFunction) => void
): void;
export function onViewportMouseDown(
  optionsOrListener: any,
  maybeListener?: (
    evt: ViewportMouseEvent,
    beginDrag: BeginDragFunction
  ) => void
) {
  let options: ViewportMouseDownOptions = {
    ...(maybeListener ? optionsOrListener : {}),
  };

  const listener: (evt: ViewportMouseEvent, beginDrag: BeginDragFunction) => void =
    maybeListener ?? optionsOrListener;

  const ctx = getToolContext();

  const mousePos = useViewportMousePos();

  useEventListener(ctx.canvas, "pointerdown", (evt: MouseEvent) => {
    if (options.button !== undefined && evt.button !== options.button) {
      return;
    }
    if (options.shiftKey !== undefined && evt.shiftKey !== options.shiftKey) {
      return;
    }
    if (options.ctrlKey !== undefined && evt.ctrlKey !== options.ctrlKey) {
      return;
    }
    if (options.altKey !== undefined && evt.altKey !== options.altKey) {
      return;
    }

    listener(new ViewportMouseEvent(evt, mousePos.value), (onDrag, onEnd) => {
      beginDrag(mousePos, onDrag, onEnd)
    });
  });
}

onViewportMouseDown.left = (listener: (evt: ViewportMouseEvent, beginDrag: BeginDragFunction) => void) => {
  onViewportMouseDown({ button: MouseButton.Left }, listener);
};

onViewportMouseDown.middle = (listener: (evt: ViewportMouseEvent, beginDrag: BeginDragFunction) => void) => {
  onViewportMouseDown({ button: MouseButton.Middle }, listener);
};

onViewportMouseDown.right = (listener: (evt: ViewportMouseEvent, beginDrag: BeginDragFunction) => void) => {
  onViewportMouseDown({ button: MouseButton.Right }, listener);
};

export interface ViewportMouseDownOptions {
  button?: MouseButton;
  shiftKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
}

export function onViewportDrag(options: ViewportDragOptions) {
  const mousePos = useViewportMousePos();
  onViewportMouseDown((evt) => {
    options.onStart?.(evt);
    if (evt.defaultPrevented) return;
    beginDrag(mousePos, options.onDrag, options.onEnd);
  });
}

export function beginDrag(
  mousePos: Readonly<Ref<Vec2>>,
  onDrag: (evt: ViewportMouseEvent, startPos: Vec2) => void,
  onEnd?: (evt: ViewportMouseEvent, startPos: Vec2) => void
) {
  const startPos = mousePos.value;
  let lastPos = startPos;

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", function onUp(evt: PointerEvent) {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);

    const event = new ViewportMouseEvent(evt, mousePos.value);
    event.dragDelta = Vec2.sub(event.pos, lastPos);
    event.dragStart = startPos;

    onEnd?.(event, startPos);
  });

  function onMove(evt: PointerEvent) {
    const event = new ViewportMouseEvent(evt, mousePos.value);
    event.dragDelta = Vec2.sub(event.pos, lastPos);
    event.dragStart = startPos;

    onDrag(event, startPos);

    lastPos = event.pos;
  }
}

onViewportDrag.left = (options: ViewportDragOptions) => {
  onViewportDrag({
    ...options,
    onStart: (evt) => {
      if (evt.button !== MouseButton.Left) return;
      options.onStart?.(evt);
    },
  });
};

onViewportDrag.middle = (options: ViewportDragOptions) => {
  onViewportDrag({
    ...options,
    onStart: (evt) => {
      if (evt.button !== MouseButton.Middle) return;
      options.onStart?.(evt);
    },
  });
};

onViewportDrag.right = (options: ViewportDragOptions) => {
  onViewportDrag({
    ...options,
    onStart: (evt) => {
      if (evt.button !== MouseButton.Right) return;
      options.onStart?.(evt);
    },
  });
};

export interface ViewportDragOptions {
  onStart?: (evt: ViewportMouseEvent) => void;
  onDrag: (evt: ViewportMouseEvent, startPos: Vec2) => void;
  onEnd?: (evt: ViewportMouseEvent, startPos: Vec2) => void;
}

export class ViewportMouseEvent {
  constructor(
    public readonly event: PointerEvent | MouseEvent,
    public readonly pos: Vec2
  ) {}

  dragDelta?: Vec2;

  dragStart?: Vec2;

  get button() {
    return this.event.button;
  }

  get shiftKey() {
    return this.event.shiftKey;
  }

  get ctrlKey() {
    return this.event.ctrlKey;
  }

  get altKey() {
    return this.event.altKey;
  }

  preventDefault() {
    this.event.preventDefault();
  }

  stopPropagation() {
    this.event.stopPropagation();
  }

  stopImmediatePropagation() {
    this.event.stopImmediatePropagation();
  }

  get defaultPrevented() {
    return this.event.defaultPrevented;
  }
}

export const enum MouseButton {
  Left = 0,
  Middle = 1,
  Right = 2,
}
