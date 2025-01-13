import type { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { CheckboxOperatorProperty, FloatOperatorProperty } from '@osucad/common';
import { Vec2 } from 'osucad-framework';
import { Matrix } from 'pixi.js';
import { TransformOperator } from './TransformOperator';

export class RotateOperator extends TransformOperator {
  constructor(hitObjects: OsuHitObject[], angle: number = 0) {
    super({
      title: 'Rotate',
    }, hitObjects);
    this.angle.value = angle;
  }

  readonly angle = new FloatOperatorProperty({
    title: 'Angle',
    defaultValue: 0,
    precision: 0,
  });

  readonly selectionCenter = new CheckboxOperatorProperty({
    title: 'Selection Center',
    defaultValue: false,
    remember: true,
  });

  protected override getMatrix(): Matrix {
    const center = this.selectionCenter.value
      ? this.center
      : new Vec2(256, 192);

    return new Matrix()
      .translate(-center.x, -center.y)
      .rotate(this.angle.value / 180 * Math.PI)
      .translate(center.x, center.y);
  }

  protected override get recalculateSliderLength(): boolean {
    return false;
  }
}
