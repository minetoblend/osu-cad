import type {
  DragEvent,
  MouseDownEvent,
  Vec2,
} from 'osucad-framework';
import {
  Action,
  Anchor,
  Axes,
  Bindable,
  CompositeDrawable,
  MouseButton,
  dependencyLoader,
} from 'osucad-framework';
import type { Graphics } from 'pixi.js';
import { Ring } from '../../../../../drawables/Ring';
import { GraphicsDrawable } from '../../../../../drawables/GraphicsDrawable';

export class RotationGizmo extends CompositeDrawable {
  constructor(center: Vec2, readonly radius: number = 75) {
    super();

    this.position = center;
    this.width = this.height = radius * 2;
    this.origin = Anchor.Center;
  }

  currentAngle = new Bindable(0);

  snappedAngle = new Bindable(0);

  onRotate = new Action<number>();

  rotateEnd = new Action<number>();

  #angleVisualizer = new RotationVisualizer(this.radius);

  #snapVisualizer = new SnapVisualizer(this.radius + 10);

  @dependencyLoader()
  load() {
    this.addAllInternal(
      this.#angleVisualizer,
      this.#ring = new Ring({
        relativeSizeAxes: Axes.Both,
        strokeWidth: 1.5,
        alpha: 0.5,
      }),
      this.#snapVisualizer,
    );

    this.#snapVisualizer.alpha = 0;

    this.snappedAngle.addOnChangeListener((e) => {
      this.#angleVisualizer.angle = e.value;
    });
  }

  #ring!: Ring;

  receivePositionalInputAt(screenSpacePosition: Vec2): boolean {
    const localSpace = this.toLocalSpace(screenSpacePosition).sub(this.rotationCenter);

    return Math.abs(localSpace.length() - this.radius) < 5;
  }

  onHover() {
    this.#updateState();

    return true;
  }

  onHoverLost() {
    this.#updateState();

    return true;
  }

  #updateState() {
    const active = this.isHovered || this.isDragged;

    this.#ring.alpha = active ? 1 : 0.5;
  }

  #lastAngle = 0;

  #startAngle = 0;

  get rotationCenter() {
    return this.drawSize.scale(0.5);
  }

  onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      this.#startAngle = this.#lastAngle = e.mousePosition.sub(this.rotationCenter).angle();

      this.#angleVisualizer.rotation = this.#startAngle;
      this.#snapVisualizer.rotation = this.#startAngle;

      return true;
    }

    return false;
  }

  onDragStart(): boolean {
    return true;
  }

  preciseRotationEnabled = true;

  snappingEnabled = true;

  snapAngleDegrees = 15;

  onDrag(e: DragEvent): boolean {
    if (this.isDisposed)
      return false;

    const angle = e.mousePosition.sub(this.rotationCenter).angle();

    let delta = angle - this.#lastAngle;
    if (Math.abs(delta) > Math.PI) {
      delta -= Math.sign(delta) * Math.PI * 2;
    }

    if (this.preciseRotationEnabled && e.shiftPressed) {
      delta *= 0.1;
    }

    let newAngle = this.currentAngle.value + delta;

    if (newAngle > Math.PI * 2) {
      newAngle -= Math.PI * 2;
    }
    else if (newAngle < -Math.PI * 2) {
      newAngle += Math.PI * 2;
    }

    this.currentAngle.value = newAngle;

    let snappedAngle = newAngle;

    if (this.snappingEnabled && e.controlPressed) {
      const snapAngle = this.snapAngleDegrees * Math.PI / 180;

      snappedAngle = Math.round(snappedAngle / snapAngle) * snapAngle;

      this.#snapVisualizer.alpha = 0.5;
    }
    else {
      this.#snapVisualizer.alpha = 0;
    }

    this.onRotate.emit(snappedAngle - this.snappedAngle.value);

    this.snappedAngle.value = snappedAngle;

    this.#lastAngle = angle;

    return true;
  }

  onDragEnd(): boolean {
    this.currentAngle.value = this.snappedAngle.value;

    this.rotateEnd.emit(this.snappedAngle.value);

    this.#snapVisualizer.alpha = 0;

    return true;
  }
}

class RotationVisualizer extends GraphicsDrawable {
  constructor(readonly readius: number) {
    super();

    this.anchor = Anchor.Center;
    this.alpha = 0.25;
  }

  get angle() {
    return this.#angle;
  }

  set angle(value: number) {
    if (value === this.#angle)
      return;

    this.#angle = value;

    this.invalidateGraphics();
  }

  #angle = 0;

  updateGraphics(g: Graphics) {
    g.clear();

    if (this.#angle === 0)
      return;

    g.moveTo(0, 0)
      .arc(0, 0, this.readius, 0, this.#angle, this.#angle < 0)
      .lineTo(0, 0)
      .fill({ color: 0xFFFFFF });
  }
}

class SnapVisualizer extends GraphicsDrawable {
  constructor(readonly radius: number) {
    super();

    this.anchor = Anchor.Center;
  }

  updateGraphics(g: Graphics) {
    g.clear();

    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 12) {
      const sin = Math.sin(angle);
      const cos = Math.cos(angle);

      const innerRadius = this.radius - 5;

      g.moveTo(cos * innerRadius, sin * innerRadius);
      g.lineTo(cos * this.radius, sin * this.radius);
    }

    g.stroke({ color: 0xFFFFFF, width: 1 });
  }
}
