import { type Drawable, Invalidation } from "../graphics/drawables/Drawable";
import type { Vec2 } from "../math";
import type { List } from "../utils";
import { debugAssert } from "../utils/debugAssert";
import { ButtonEventManager } from "./ButtonEventManager";
import { ClickEvent } from "./events/ClickEvent";
import { DoubleClickEvent } from "./events/DoubleClickEvent";
import { DragEndEvent } from "./events/DragEndEvent";
import { DragEvent } from "./events/DragEvent";
import { DragStartEvent } from "./events/DragStartEvent";
import { MouseDownEvent } from "./events/MouseDownEvent";
import { MouseUpEvent } from "./events/MouseUpEvent";
import type { InputState } from "./state/InputState";
import type { MouseButton } from "./state/MouseButton";

export abstract class MouseButtonEventManager extends ButtonEventManager<MouseButton>
{
  protected abstract get enableDrag(): boolean;

  protected abstract get enableClick(): boolean;

  protected abstract get changeFocusOnClick(): boolean;

  public blockNextClick = false;

  private mouseDownPosition: Vec2 | null = null;

  protected dragStarted = false;

  private draggedDrawable: Drawable | null = null;

  private doubleClickTime = 150;

  public clickDragDistance = 10;

  private lastClickTime: number | null = null;

  public handlePositionChange(state: InputState, lastPosition: Vec2)
  {
    if (this.enableDrag)
    {
      if (!this.dragStarted)
      {
        const mouse = state.mouse;
        if (
          mouse.isPressed(this.button)
            && mouse.position.distance(this.mouseDownPosition ?? mouse.position) > this.clickDragDistance
        )
        {
          this.#handleDragStart(state);
        }
      }

      if (this.dragStarted)
      {
        this.#handleDrag(state, lastPosition);
      }
    }
  }

  protected override handleButtonDown(state: InputState, targets: List<Drawable>): Drawable | null
  {
    debugAssert(state.mouse.isPressed(this.button), "Mouse button must be pressed");

    if (state.mouse.isPositionValid)
      this.mouseDownPosition = state.mouse.position;

    const handledBy = this.propagateButtonEvent(
        targets,
        new MouseDownEvent(state, this.button, this.mouseDownPosition),
    );

    if (this.lastClickTime !== null && this.inputManager.time.current - this.lastClickTime < this.doubleClickTime)
    {
      if (this.#handleDoubleClick(state, targets))
      {
        // when we handle a double-click we want to block a normal click from firing.
        this.blockNextClick = true;
        this.lastClickTime = null;
      }
    }

    return handledBy;
  }

  protected override handleButtonUp(state: InputState, targets: Drawable[] | null): void
  {
    debugAssert(!state.mouse.isPressed(this.button), "Mouse button must be released");

    if (targets !== null)
      this.propagateButtonEvent(targets, new MouseUpEvent(state, this.button, this.mouseDownPosition));

    if (this.enableClick && this.draggedDrawable?.dragBlocksClick !== true)
    {
      if (!this.blockNextClick)
      {
        this.lastClickTime = this.inputManager.time.current;
        this.#handleClick(state, targets);
      }
    }

    this.blockNextClick = false;

    if (this.enableDrag)
    {
      this.dragStarted = false;
      this.#handleDragDrawableEnd(state);
    }

    state.draggedFiles = null;

    this.mouseDownPosition = null;
  }

  private clickedDrawable: WeakRef<Drawable> | null = null;

  #handleClick(state: InputState, targets: Drawable[] | null)
  {
    if (targets === null)
      return;

    const queue = new Set(this.getInputQueue());
    const drawables = targets.filter(t => queue.has(t) && t.receivePositionalInputAt(state.mouse.position));

    const clicked = this.propagateButtonEvent(drawables, new ClickEvent(state, this.button, this.mouseDownPosition));

    if (clicked)
    {
      this.clickedDrawable = new WeakRef(clicked);
    }
    else
    {
      this.clickedDrawable = null;
    }

    if (this.changeFocusOnClick)
      this.inputManager.changeFocusFromClick(clicked);
  }

  #handleDoubleClick(state: InputState, targets: List<Drawable>): boolean
  {
    const clicked = this.clickedDrawable?.deref();
    if (!clicked)
      return false;

    if (!targets.contains(clicked))
      return false;

    return this.propagateButtonEvent(targets, new DoubleClickEvent(state, this.button, this.mouseDownPosition)) !== null;
  }

  #handleDrag(state: InputState, lastPosition: Vec2)
  {
    if (this.draggedDrawable === null)
      return;

    this.propagateButtonEvent(
        [this.draggedDrawable],
        new DragEvent(state, this.button, this.mouseDownPosition, lastPosition),
    );
  }

  #handleDragStart(state: InputState)
  {
    debugAssert(this.draggedDrawable === null, "Dragged drawable must be null");
    debugAssert(!this.dragStarted, "Drag must not be started");
    debugAssert(this.mouseDownPosition !== null, "Mouse down position must not be null");

    this.dragStarted = true;

    const drawables = (this.buttonDownInputQueue ?? []).filter(d => d.isRootedAt(this.inputManager));

    const draggable = this.propagateButtonEvent(
        drawables,
        new DragStartEvent(state, this.button, this.mouseDownPosition),
    );
    if (draggable !== null)
      this.#handleDragDrawableBegin(draggable);
  }

  #handleDragDrawableBegin(draggedDrawable: Drawable)
  {
    this.draggedDrawable = draggedDrawable;
    draggedDrawable.isDragged = true;
    draggedDrawable.invalidated.addListener(this.#draggedDrawableInvalidated, this);
  }

  #draggedDrawableInvalidated(drawable: Drawable, invalidation: Invalidation)
  {
    if (invalidation & Invalidation.Parent)
    {
      // end drag if no longer rooted.
      if (!drawable.isRootedAt(this.inputManager))
        this.#handleDragDrawableEnd();
    }
  };

  #handleDragDrawableEnd(state: InputState | null = null)
  {
    const previousDragged = this.draggedDrawable;

    if (previousDragged === null)
      return;

    previousDragged.invalidated.removeListener(this.#draggedDrawableInvalidated, this);
    previousDragged.isDragged = false;

    this.draggedDrawable = null;

    if (state !== null)
      this.propagateButtonEvent([previousDragged], new DragEndEvent(state, this.button, this.mouseDownPosition));
  }
}
