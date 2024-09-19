import type {
  DragEvent,
  MouseDownEvent,
} from 'osucad-framework';
import {
  Action,
  Anchor,
  Bindable,
  Box,
  CompositeDrawable,
  Container,
  Direction,
  MouseButton,
  Vec2,
  dependencyLoader,
} from 'osucad-framework';
import { DragLine } from './DragLine';

export class ScaleGizmo extends CompositeDrawable {
  constructor(position: Vec2) {
    super();

    this.position = position;
  }

  @dependencyLoader()
  load() {
    const scaleX = new DirectionalScaleHandle(Direction.Horizontal);
    const scaleY = new DirectionalScaleHandle(Direction.Vertical);
    const scaleUniform = new UniformScaleHandle(50);

    this.addAllInternal(scaleX, scaleY, scaleUniform);

    scaleX.onScale.addListener((value) => {
      this.scaleValue.value = this.scaleValue.value.mul({ x: value, y: 1 });
    });
    scaleY.onScale.addListener((value) => {
      this.scaleValue.value = this.scaleValue.value.mul({ x: 1, y: value });
    });
    scaleUniform.onScale.addListener((value) => {
      this.scaleValue.value = this.scaleValue.value.mul({ x: value, y: value });
    });

    scaleX.scaleEnd.addListener(() => this.scaleEnd.emit(this.scaleValue.value));
    scaleY.scaleEnd.addListener(() => this.scaleEnd.emit(this.scaleValue.value));
    scaleUniform.scaleEnd.addListener(() => this.scaleEnd.emit(this.scaleValue.value));
  }

  scaleValue = new Bindable(new Vec2(1));

  scaleEnd = new Action<Vec2>();
}

class DirectionalScaleHandle extends CompositeDrawable {
  constructor(
    readonly direction: Direction,
    readonly gizmoSize = 75,
  ) {
    super();

    const color = direction === Direction.Horizontal ? 0xF76459 : 0x3172F5;

    this.addAllInternal(
      this.#line = new Box({
        width: gizmoSize,
        height: 1,
        anchor: Anchor.Center,
        origin: Anchor.CenterLeft,
        color,
        alpha: 0.8,
      }),
      new Box({
        x: gizmoSize,
        width: 8,
        height: 8,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        color: 0x222228,
        alpha: 0.25,
      }),
      this.#dragLine,
      this.#handle = new Container({
        width: 16,
        height: 16,
        x: gizmoSize,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        children: [
          new Box({
            width: 8,
            height: 8,
            anchor: Anchor.Center,
            origin: Anchor.Center,
            color,
          }),
          this.#hoverOverlay = new Box({
            width: 8,
            height: 8,
            anchor: Anchor.Center,
            origin: Anchor.Center,
            alpha: 0,
          }),
        ],
      }),
    );

    this.rotation = direction === Direction.Horizontal ? 0 : -Math.PI / 2;
  }

  readonly #line: Box;

  readonly #handle: Container;

  readonly #hoverOverlay: Box;

  #dragLine = new DragLine();

  receivePositionalInputAt(screenSpacePosition: Vec2): boolean {
    return this.isDragged || this.#handle.receivePositionalInputAt(screenSpacePosition);
  }

  receivePositionalInputAtLocal(localPosition: Vec2): boolean {
    const local = this.#handle.localTransform.applyInverse(localPosition, new Vec2());
    return this.isDragged || this.#handle.receivePositionalInputAtLocal(local);
  }

  onHover(): boolean {
    this.#updateState();

    return true;
  }

  onHoverLost(): boolean {
    this.#updateState();

    return true;
  }

  #updateState() {
    this.#hoverOverlay.alpha
      = (this.isHovered || this.isDragged) ? 0.5 : 0;
  }

  #lastDragPosition = Vec2.zero();

  onScale = new Action<number>();

  scaleEnd = new Action();

  onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      this.#lastDragPosition = e.mousePosition;

      this.#line.origin = Anchor.Center;
      this.#line.width = 10_000;

      return true;
    }

    return false;
  }

  onDragStart(): boolean {
    return true;
  }

  onDrag(e: DragEvent): boolean {
    const position = e.mousePosition;

    const delta = position.sub(this.#lastDragPosition);

    if (Math.abs(position.x) < 5)
      return true;

    this.onScale.emit((this.#handle.x + delta.x) / this.#handle.x);

    this.#handle.x += delta.x;

    this.#lastDragPosition = this.toLocalSpace(e.screenSpaceMousePosition);

    this.#dragLine.endPosition = this.parent!.toLocalSpace(e.screenSpaceMousePosition);

    return true;
  }

  onDragEnd(): boolean {
    this.#handle.x = this.gizmoSize;
    this.#line.width = this.gizmoSize;
    this.#line.origin = Anchor.CenterLeft;

    this.#dragLine.clear();

    this.#updateState();

    this.scaleEnd.emit();

    return true;
  }
}

class UniformScaleHandle extends CompositeDrawable {
  constructor(readonly radius: number) {
    super();

    this.width = 16;
    this.height = 16;

    this.addAllInternal(
      this.#dragLine,
      new Box({
        x: radius,
        y: -radius,
        width: 8,
        height: 8,
        origin: Anchor.Center,
        color: 0x222228,
        alpha: 0.25,
      }),
      this.#handle = new Container({
        x: radius,
        y: -radius,
        width: 16,
        height: 16,
        origin: Anchor.Center,
        children: [
          new Box({
            width: 8,
            height: 8,
            anchor: Anchor.Center,
            origin: Anchor.Center,
            color: 0x7BF759,
          }),
          this.#hoverOverlay = new Box({
            width: 8,
            height: 8,
            anchor: Anchor.Center,
            origin: Anchor.Center,
            alpha: 0,
          }),
        ],
      }),

    );
  }

  @dependencyLoader()
  load() {
    this.#currentScale.addOnChangeListener((e) => {
      this.#handle.x = this.radius * e.value;
      this.#handle.y = -this.radius * e.value;
    });
  }

  onScale = new Action<number>();

  scaleEnd = new Action();

  #handle: Container;

  #hoverOverlay: Box;

  receivePositionalInputAt(screenSpacePosition: Vec2): boolean {
    return this.isDragged || this.#handle.receivePositionalInputAt(screenSpacePosition);
  }

  receivePositionalInputAtLocal(localPosition: Vec2): boolean {
    const local = this.#handle.localTransform.applyInverse(localPosition, new Vec2());

    return this.isDragged || this.#handle.receivePositionalInputAtLocal(local);
  }

  onHover(): boolean {
    this.#updateState();

    return true;
  }

  onHoverLost(): boolean {
    this.#updateState();

    return true;
  }

  #updateState() {
    this.#hoverOverlay.alpha
      = (this.isHovered || this.isDragged) ? 0.5 : 0;
  }

  #dragLine = new DragLine();

  #currentScale = new Bindable(1);

  onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      this.#lastDistance = e.mousePosition.length();
      this.#isNegative = false;

      return true;
    }

    return false;
  }

  onDragStart(): boolean {
    return true;
  }

  #lastDistance = 0;

  #isNegative = false;

  onDrag(e: DragEvent): boolean {
    this.#dragLine.endPosition = this.parent!.toLocalSpace(e.screenSpaceMousePosition);

    const distance = e.mousePosition.length();

    if (Math.abs(distance) < 5)
      return true;

    let scaleDelta = distance / this.#lastDistance;

    const isNegative = e.mousePosition.normalize().dot(new Vec2(1, -1).normalize()) < 0;

    if (this.#isNegative !== isNegative) {
      scaleDelta *= -1;
      this.#isNegative = isNegative;
    }

    this.#currentScale.value *= scaleDelta;

    this.onScale.emit(scaleDelta);

    this.#lastDistance = distance;

    return true;
  }

  onDragEnd(): boolean {
    this.#dragLine.clear();
    this.#currentScale.value = 1;

    this.scaleEnd.emit();

    return true;
  }
}
