import type { Bindable, DragEndEvent, DragEvent, DragStartEvent, HoverEvent, HoverLostEvent, MouseDownEvent } from 'osucad-framework';
import { Ring } from '@osucad/editor/drawables/Ring';
import { Anchor, Axes, BindableWithCurrent, CircleSegment, CompositeDrawable, Vec2 } from 'osucad-framework';

export class RotateGizmo extends CompositeDrawable {
  constructor(readonly radius: number) {
    super();

    this.size = new Vec2(radius * 2);
    this.origin = Anchor.Center;

    this.internalChildren = [
      this.#ring = new Ring({
        relativeSizeAxes: Axes.Both,
        strokeWidth: 1,
        alpha: 0.5,
      }),
      this.#circleSegment = new CircleSegment({
        relativeSizeAxes: Axes.Both,
        alpha: 0,
      }),
    ];
  }

  readonly #ring: Ring;

  readonly #circleSegment: CircleSegment;

  private angleBindable = new BindableWithCurrent(0);

  get angle(): Bindable<number> {
    return this.angleBindable;
  }

  set angle(value) {
    this.angleBindable.current = value;
  }

  override receivePositionalInputAt(screenSpacePosition: Vec2): boolean {
    const distance = this.toLocalSpace(screenSpacePosition).distance(this.drawSize.scale(0.5));

    const threshold = 10;

    return Math.abs(distance - this.radius) * 2 < threshold;
  }

  override onHover(e: HoverEvent): boolean {
    this.#updateRing();
    return true;
  }

  override onHoverLost(e: HoverLostEvent) {
    this.#updateRing();
  }

  #updateRing() {
    this.#ring.alpha = this.isHovered || this.isDragged ? 1 : 0.5;
  }

  #mouseDownAngle = 0;
  #dragStartAngle = 0;
  #totalDelta = 0;

  override onMouseDown(e: MouseDownEvent): boolean {
    return true;
  }

  override onDragStart(e: DragStartEvent): boolean {
    const startPosition = this.toLocalSpace(e.screenSpaceMouseDownPosition!)
      .sub(this.drawSize.scale(0.5));

    this.#dragStartAngle = this.angle.value;
    this.#totalDelta = 0;

    this.#mouseDownAngle = startPosition.angle();

    this.#circleSegment.alpha = 0.2;
    this.#circleSegment.startAngle = this.#mouseDownAngle;

    this.#updateRing();

    return true;
  }

  override onDrag(e: DragEvent): boolean {
    function mod(a: number, n: number) {
      return ((a % n) + n) % n;
    }

    const angle = e.mousePosition.sub(this.drawSize.scale(0.5)).angle();

    const lastAngle = this.toLocalSpace(e.screenSpaceLastMousePosition).sub(this.drawSize.scale(0.5)).angle();

    let delta = mod(mod(angle - lastAngle, Math.PI * 2), Math.PI * 2);
    if (delta > Math.PI)
      delta -= Math.PI * 2;

    this.angle.value += delta;
    this.#totalDelta += delta;

    let startAngle = this.#mouseDownAngle;
    const endAngle = this.#mouseDownAngle + this.#totalDelta;

    let angleDifference = mod(mod(endAngle - startAngle, Math.PI * 2), Math.PI * 2);

    if (this.#totalDelta < 0) {
      startAngle = endAngle;
      angleDifference *= -1;
    }

    this.#circleSegment.startAngle = startAngle;
    this.#circleSegment.endAngle = startAngle + angleDifference;

    return true;
  }

  override onDragEnd(e: DragEndEvent) {
    this.#circleSegment.hide();
    this.#updateRing();
  }
}
