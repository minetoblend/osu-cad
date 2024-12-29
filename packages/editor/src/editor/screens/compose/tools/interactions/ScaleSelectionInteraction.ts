import type { OsuHitObject } from '@osucad/common';
import type { KeyDownEvent, Rectangle } from 'osucad-framework';
import { Slider } from '@osucad/common';
import { Container, dependencyLoader, Key, Vec2 } from 'osucad-framework';
import { Matrix } from 'pixi.js';
import { HitObjectComposer } from '../../HitObjectComposer';
import { HitObjectUtils } from '../../HitObjectUtils';
import { ComposeToolInteraction } from './ComposeToolInteraction';
import { RotationGizmo } from './RotationGizmo';
import { ScaleGizmo } from './ScaleGizmo';
import { TranslateGizmo } from './TranslateGizmo';

export class ScaleSelectionInteraction extends ComposeToolInteraction {
  constructor(
    readonly hitObjects: OsuHitObject[],
  ) {
    super();

    this.selectionBounds = new HitObjectUtils().getBounds(this.hitObjects);

    this.selectionCenter = this.transformCenter = this.selectionBounds.center;
  }

  selectionCenter: Vec2;

  selectionBounds: Rectangle;

  #gizmoContainer!: Container;

  #scaleGizmo!: ScaleGizmo;

  #rotationGizmo!: RotationGizmo;

  #translateGizmo!: TranslateGizmo;

  #utils!: HitObjectUtils;

  currentScale: Vec2 = new Vec2(1);

  currentRotation: number = 0;

  #converted = false;

  @dependencyLoader()
  load() {
    this.addAllInternal(
      this.#utils = new HitObjectUtils(),
      this.#gizmoContainer = new Container({
        position: this.transformCenter,
        children: [
          this.#rotationGizmo = new RotationGizmo(new Vec2(), 100),
          this.#scaleGizmo = new ScaleGizmo(new Vec2()),
          this.#translateGizmo = new TranslateGizmo(this.selectionCenter),
        ],
      }),
    );

    this.#scaleGizmo.scaleValue.addOnChangeListener(({ value }) => {
      if (Math.abs(value.x) < 0.05)
        value.x = 0.05 * Math.sign(value.x);

      if (Math.abs(value.y) < 0.05)
        value.y = 0.05 * Math.sign(value.y);

      this.currentScale = value;
      this.#updateTransform();
    });

    this.#rotationGizmo.onRotate.addListener((value) => {
      this.currentRotation += value;
      this.#scaleGizmo.rotation = this.currentRotation;

      this.#updateTransform();
    });

    this.#rotationGizmo.rotateEnd.addListener(() => {
      this.#rotationGizmo.currentAngle.value = this.#rotationGizmo.snappedAngle.value = 0;
    });

    this.#translateGizmo.positionValue.addOnChangeListener(({ value }) => {
      const snapResult = this.#composer.snapHitObjectPosition([value], 5, false);

      if (snapResult.offset) {
        value = value.add(snapResult.offset);
      }

      this.#gizmoContainer.position = value;
      this.transformCenter = value;

      this.#updateTransform();
      this.updateSubTreeTransforms();
    });
  }

  #composer!: HitObjectComposer;

  loadComplete() {
    super.loadComplete();

    this.#composer = this.findClosestParentOfType(HitObjectComposer)!;

    this.#updateTransform();
  }

  onMouseDown(): boolean {
    this.complete();

    return false;
  }

  transformCenter: Vec2;

  #updateTransform() {
    const center = this.transformCenter;

    const transform = new Matrix()
      .translate(-center.x, -center.y)
      .rotate(-this.currentRotation)
      .scale(this.currentScale.x, this.currentScale.y)
      .rotate(this.currentRotation)
      .translate(center.x, center.y);

    // this.commandManager.undoCurrentTransaction();

    if (this.currentScale.x !== this.currentScale.y && !this.#converted) {
      for (const object of this.hitObjects) {
        if (object instanceof Slider) {
          this.#utils.convertToBezier(object);
        }
      }
      this.#converted = true;
    }

    this.#utils.transformHitObjects(
      transform.clone().append(this.#previousTransform.invert()),
      this.hitObjects,
      false,
    );

    this.#previousTransform = transform;
  }

  #previousTransform = new Matrix();

  onKeyDown(e: KeyDownEvent): boolean {
    if (e.key === Key.Escape) {
      this.cancel();
      return true;
    }

    return false;
  }
}
