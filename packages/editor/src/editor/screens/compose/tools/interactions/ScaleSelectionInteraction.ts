import type { HitObject } from '@osucad/common';
import type { KeyDownEvent } from 'osucad-framework';
import { Container, Key, Vec2, dependencyLoader } from 'osucad-framework';
import type { Rectangle } from 'osucad-framework/math';
import { Matrix } from 'pixi.js';
import { HitObjectUtils } from '../../HitObjectUtils';
import { HitObjectComposer } from '../../HitObjectComposer';
import { ComposeToolInteraction } from './ComposeToolInteraction';
import { ScaleGizmo } from './ScaleGizmo';
import { RotationGizmo } from './RotationGizmo';
import { TranslateGizmo } from './TranslateGizmo';

export class ScaleSelectionInteraction extends ComposeToolInteraction {
  constructor(
    readonly hitObjects: HitObject[],
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

    this.#scaleGizmo.scaleValue.addOnChangeListener((value) => {
      if (Math.abs(value.x) < 0.05)
        value.x = 0.05 * Math.sign(value.x);

      if (Math.abs(value.y) < 0.05)
        value.y = 0.05 * Math.sign(value.y);

      this.currentScale = value;
      this.#updateTransform();
    });

    this.#rotationGizmo.snappedAngle.addOnChangeListener((value) => {
      this.currentRotation = value;
      this.#scaleGizmo.rotation = value;

      this.#updateTransform();
    });

    this.#translateGizmo.positionValue.addOnChangeListener((value) => {
      const snapResult = this.findClosestParentOfType(HitObjectComposer)!.snapHitObjectPosition([value]);

      if (snapResult.offset) {
        value = value.add(snapResult.offset);
      }

      this.#gizmoContainer.position = value;
      this.transformCenter = value;

      this.#updateTransform();
      this.updateSubTreeTransforms();
    });
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

    this.commandManager.undoCurrentTransaction();

    this.#utils.transformHitObjects(
      transform,
      this.hitObjects,
      false,
    );
  }

  onKeyDown(e: KeyDownEvent): boolean {
    if (e.key === Key.Escape) {
      this.cancel();
      return true;
    }

    return false;
  }
}
