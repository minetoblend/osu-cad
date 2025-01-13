import type { InputManager, KeyDownEvent, MouseDownEvent, MouseMoveEvent } from 'osucad-framework';
import type { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { Axes, CompositeDrawable, Key, MouseButton, resolved, Vec2 } from 'osucad-framework';
import { HitObjectComposer } from '../../../../editor/screens/compose/HitObjectComposer';
import { MoveOperator } from './MoveOperator';

export class MoveInteraction extends CompositeDrawable {
  constructor(
    readonly hitObjects: OsuHitObject[],
  ) {
    super();

    this.relativeSizeAxes = Axes.Both;

    this.operator = new MoveOperator(hitObjects);
  }

  operator!: MoveOperator;

  #startMousePosition = new Vec2();

  #inputManager!: InputManager;

  @resolved(HitObjectComposer)
  composer!: HitObjectComposer;

  constrainedAxes = Axes.None;

  protected override loadComplete() {
    super.loadComplete();

    this.#inputManager = this.getContainingInputManager()!;

    this.#startMousePosition = this.toLocalSpace(
      this.#inputManager.currentState.mouse.position,
    );

    this.operator.ended.addListener(() => this.expire());

    this.composer.beginOperator(this.operator);
  }

  override onMouseMove(e: MouseMoveEvent): boolean {
    this.updatePosition();

    return true;
  }

  updatePosition() {
    const position = this.toLocalSpace(this.#inputManager.currentState.mouse.position);

    const delta = position.sub(this.#startMousePosition);

    if (this.constrainedAxes & Axes.X)
      delta.x = 0;
    if (this.constrainedAxes & Axes.Y)
      delta.y = 0;

    this.operator.delta.value = delta;
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      this.composer.completeOperator(this.operator);
      return true;
    }
    return false;
  }

  override onKeyDown(e: KeyDownEvent): boolean {
    if (e.key === Key.KeyX) {
      this.constrainedAxes = this.constrainedAxes === Axes.Y ? Axes.None : Axes.Y;

      this.updatePosition();
      return true;
    }

    if (e.key === Key.KeyY) {
      this.constrainedAxes = this.constrainedAxes === Axes.X ? Axes.None : Axes.X;

      this.updatePosition();
      return true;
    }

    return false;
  }
}
