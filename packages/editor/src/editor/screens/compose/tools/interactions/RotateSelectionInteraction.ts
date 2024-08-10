import type { HitObject } from '@osucad/common';
import type {
  DragEvent,
  DragStartEvent,
  KeyDownEvent,
  KeyUpEvent,
  MouseDownEvent,
} from 'osucad-framework';
import {
  Action,
  Anchor,
  Axes,
  CompositeDrawable,
  Key,
  MouseButton,
  RoundedBox,
  Vec2,
  dependencyLoader,
} from 'osucad-framework';

import type { IVec2, Rectangle } from 'osucad-framework/math';
import { Graphics, Matrix } from 'pixi.js';
import { HitObjectUtils } from '../../HitObjectUtils';
import { HitObjectComposer } from '../../HitObjectComposer';
import { OsucadSpriteText } from '../../../../../OsucadSpriteText';
import { ComposeToolInteraction } from './ComposeToolInteraction';

export class RotateSelectionInteraction extends ComposeToolInteraction {
  constructor(
    readonly hitObjects: HitObject[],
  ) {
    super();

    this.selectionBounds = new HitObjectUtils().getBounds(this.hitObjects);

    this.selectionCenter = this.selectionBounds.center;
  }

  selectionCenter!: Vec2;

  selectionBounds: Rectangle;

  #hitobjectUtils = new HitObjectUtils();

  #previousTransform = new Matrix();

  #customRotationCenter?: Vec2;

  #handle!: RotationHandle;

  get rotationCenter() {
    return this.#customRotationCenter ?? this.selectionCenter;
  }

  @dependencyLoader()
  load() {
    const handle = this.#handle = new RotationHandle(
      80,
      this.selectionCenter,
    );

    this.addAllInternal(this.#hitobjectUtils, handle);

    handle.onRotate.addListener(delta => this.rotation += delta);
    handle.onRotateEnd.addListener(() => this.rotation = this.snappedRotation);

    handle.onMove.addListener((position) => {
      handle.position = position;
      this.#customRotationCenter = position;
      this.#updateTransform();
    });
  }

  get rotation() {
    return this.#rotation;
  }

  set rotation(value: number) {
    if (value > Math.PI * 2)
      value -= 2 * Math.PI;
    if (value < -Math.PI * 2)
      value += 2 * Math.PI;

    this.#rotation = value;
    this.#updateTransform();
  }

  #rotation = 0;

  snapRotation = false;

  get snappedRotation() {
    if (!this.snapRotation)
      return this.rotation;

    // 15 degrees
    const snapAngle = Math.PI / 12;

    return Math.round(this.rotation / snapAngle) * snapAngle;
  }

  #updateTransform() {
    const transform = new Matrix()
      .translate(-this.rotationCenter.x, -this.rotationCenter.y)
      .rotate(this.snappedRotation)
      .translate(this.rotationCenter.x, this.rotationCenter.y);

    this.#hitobjectUtils.transformHitObjects(
      transform.clone().append(this.#previousTransform.invert()),
      this.hitObjects,
      false,
    );

    this.#previousTransform = transform;

    this.#handle.currentRotation = this.snappedRotation;
  }

  onMouseDown(): boolean {
    this.complete();

    return false;
  }

  onKeyDown(e: KeyDownEvent): boolean {
    switch (e.key) {
      case Key.ControlLeft:
      case Key.ControlRight:
        this.snapRotation = true;
        return true;
      case Key.Escape:
        this.cancel();
        return true;
    }

    return false;
  }

  onKeyUp(e: KeyUpEvent): boolean {
    switch (e.key) {
      case Key.ControlLeft:
      case Key.ControlRight:
        this.snapRotation = false;
        return true;
    }

    return false;
  }
}

class RotationHandle extends CompositeDrawable {
  constructor(radius: number, position: IVec2) {
    super();

    this.origin = Anchor.Center;
    this.position = position;

    this.width = radius * 2;
    this.height = radius * 2;

    this.addAllInternal(
      this.#circle = new RoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: radius,
        fillAlpha: 0,
        alpha: 0.5,
        outlines: [{
          width: 1.5,
          color: 0xEDD661,
          alpha: 1,
        }],
      }),
      new RotationHandleCenter(position => this.onMove.emit(position)),
      this.#currentAngleText = new OsucadSpriteText({
        text: '0deg',
        fontSize: 11,
        position: { x: 0, y: -this.radius - 10 },
        origin: Anchor.Center,
        anchor: Anchor.Center,
      }),
    );

    this.drawNode.addChild(this.#rotationVisualizer);
  }

  get currentRotation() {
    return this.#currentRotation;
  }

  set currentRotation(value: number) {
    this.#currentRotation = value;
    this.#updateGraphics();
  }

  #rotationVisualizer = new Graphics();

  #currentRotation = 0;

  #circle: RoundedBox;

  #currentAngleText!: OsucadSpriteText;

  get rotationCenter() {
    return this.size.scale(0.5);
  }

  receivePositionalInputAt(screenSpacePosition: Vec2): boolean {
    const local = this.toLocalSpace(screenSpacePosition).sub(this.rotationCenter);

    const distance = local.length();

    return Math.abs(distance - this.radius) < 10;
  }

  onHover(): boolean {
    this.#circle.alpha = 1;
    return true;
  }

  onHoverLost(): boolean {
    if (!this.isDragged)
      this.#circle.alpha = 0.5;
    return true;
  }

  #lastAngle = 0;

  onMouseDown(e: MouseDownEvent): boolean {
    this.#lastAngle = e.mousePosition.sub(this.rotationCenter).angle();

    this.#startAngle ??= this.#lastAngle;

    return e.button === MouseButton.Left;
  }

  onDragStart(e: DragStartEvent): boolean {
    return e.button === MouseButton.Left;
  }

  onDrag(e: DragEvent): boolean {
    const angle = e.mousePosition.sub(this.rotationCenter).angle();
    let delta = angle - this.#lastAngle;
    if (Math.abs(delta) > Math.PI) {
      delta -= Math.sign(delta) * 2 * Math.PI;
    }

    this.onRotate.emit(delta);

    this.#lastAngle = angle;

    return true;
  }

  onRotate = new Action<number>();
  onRotateEnd = new Action();

  onMove = new Action<Vec2>();

  get radius() {
    return this.width / 2;
  }

  set radius(value: number) {
    this.width = value * 2;
    this.height = value * 2;
  }

  onDragEnd(): boolean {
    if (!this.isHovered)
      this.#circle.alpha = 0.5;
    this.onRotateEnd.emit();
    return true;
  }

  #startAngle?: number;

  #updateGraphics() {
    const g = this.#rotationVisualizer;
    g.clear();

    if (this.#currentRotation === 0)
      return;

    const center = this.rotationCenter;
    const radius = this.radius;

    g
      .moveTo(center.x, center.y)
      .arc(center.x, center.y, radius, this.#startAngle ?? -Math.PI / 2, this.#currentRotation + (this.#startAngle ?? -Math.PI / 2), this.#currentRotation < 0)
      .lineTo(center.x, center.y)
      .fill({ color: 0xE6D375, alpha: 0.5 })
    ;

    this.#currentAngleText.text = `${Math.round(this.#currentRotation * 180 / Math.PI)}deg`;

    this.#currentAngleText.moveTo({
      position: new Vec2(
        Math.cos(this.#currentRotation + (this.#startAngle ?? -Math.PI)) * (radius + 30),
        Math.sin(this.#currentRotation + (this.#startAngle ?? -Math.PI)) * (radius + 10),
      ),
      duration: 200,
      easing: 'power2.out',
    });
  }
}

class RotationHandleCenter extends CompositeDrawable {
  constructor(
    readonly onMove: (position: Vec2) => void,
  ) {
    super();

    this.width = 12;
    this.height = 12;
    this.anchor = Anchor.Center;
    this.origin = Anchor.Center;
    this.alpha = 0.5;

    this.addInternal(new RoundedBox({
      size: 0.5,
      anchor: Anchor.Center,
      origin: Anchor.Center,
      relativeSizeAxes: Axes.Both,
      cornerRadius: 2,
    }));
  }

  onHover() {
    this.#updateState();

    return true;
  }

  onHoverLost() {
    this.#updateState();

    return true;
  }

  onMouseDown(e: MouseDownEvent): boolean {
    return e.button === MouseButton.Left;
  }

  onDragStart(): boolean {
    this.#updateState();
    return true;
  }

  onDrag(e: DragEvent): boolean {
    let position = this.findClosestParentOfType(RotateSelectionInteraction)!.toLocalSpace(e.screenSpaceMousePosition);

    const result = this.#composer.snapHitObjectPosition([position]);

    if (result.offset) {
      position = position.add(result.offset);
    }

    this.onMove(position);

    return true;
  }

  onDragEnd(): boolean {
    this.#updateState();
    return true;
  }

  #updateState() {
    if (this.isDragged || this.isHovered) {
      this.scale = 1.25;
      this.alpha = 1;
    }
    else {
      this.scale = 1;
      this.alpha = 0.5;
    }
  }

  #composer!: HitObjectComposer;

  loadComplete() {
    super.loadComplete();

    this.#composer = this.findClosestParentOfType(HitObjectComposer)!;
  }
}
