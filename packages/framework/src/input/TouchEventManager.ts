import type { Drawable } from "../graphics";
import type { Vec2 } from "../math";
import type { List } from "../utils";
import type { TouchSource } from "./handlers/Touch";
import type { InputState } from "./state/InputState";
import { debugAssert } from "../utils/debugAssert";
import { ButtonEventManager } from "./ButtonEventManager";
import { TouchDownEvent } from "./events/TouchDownEvent";
import { TouchMoveEvent } from "./events/TouchMoveEvent";
import { TouchUpEvent } from "./events/TouchUpEvent";
import { Touch } from "./handlers/Touch";

export class TouchEventManager extends ButtonEventManager<TouchSource>
{
  touchDownPosition: Vec2 | null = null;

  heldDrawable: Drawable | null = null;

  constructor(readonly source: TouchSource)
  {
    super(source);
  }

  handlePositionChange(state: InputState, lastPosition: Vec2)
  {
    this.#handleTouchMove(state, state.touch.touchPositions[this.button], lastPosition);
  }

  #handleTouchMove(state: InputState, position: Vec2, lastPosition: Vec2)
  {
    this.propagateButtonEvent(
        this.buttonDownInputQueue!.filter(it => it.isRootedAt(this.inputManager)),
        new TouchMoveEvent(state, new Touch(this.button, position), this.touchDownPosition, lastPosition),
    );
  }

  override handleButtonDown(state: InputState, targets: List<Drawable>): Drawable | null
  {
    debugAssert(this.heldDrawable === null);

    debugAssert(this.touchDownPosition === null);
    this.touchDownPosition = state.touch.getTouchPosition(this.button);
    debugAssert(this.touchDownPosition !== null);

    return (this.heldDrawable = this.propagateButtonEvent(
        targets,
        new TouchDownEvent(state, new Touch(this.button, this.touchDownPosition!)),
    ));
  }

  override handleButtonUp(state: InputState, targets: Drawable[]): void
  {
    const currentPosition = state.touch.touchPositions[this.button];
    this.propagateButtonEvent(
        targets,
        new TouchUpEvent(state, new Touch(this.button, currentPosition), this.touchDownPosition),
    );

    this.heldDrawable = null;
    this.touchDownPosition = null;
  }
}
