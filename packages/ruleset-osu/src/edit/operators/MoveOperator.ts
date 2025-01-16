import type { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { CheckboxOperatorProperty, Operator, Vec2OperatorProperty } from '@osucad/core';
import { Vec2 } from '@osucad/framework';
import { Slider } from '../../hitObjects/Slider';

export class MoveOperator extends Operator<OsuHitObject> {
  constructor(
    readonly hitObjects: OsuHitObject[],
  ) {
    super({
      title: 'Move',
    });
  }

  readonly delta = new Vec2OperatorProperty({
    title: 'Move',
    defaultValue: new Vec2(0),
    precision: 0,
  });

  readonly clampToBounds = new CheckboxOperatorProperty({
    title: 'Clamp to playfield',
    defaultValue: true,
    remember: true,
  });

  override apply(): void {
    let delta = this.delta.value;

    if (this.clampToBounds.value)
      delta = this.moveIntoBounds(this.hitObjects, delta);

    for (const hitObject of this.hitObjects)
      hitObject.moveBy(delta);
  }

  protected moveIntoBounds(hitObjects: OsuHitObject[], delta: Vec2): Vec2 {
    const overflow = {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
    };

    for (const object of hitObjects) {
      const start = object.position.add(delta);
      let end = start;
      if (object instanceof Slider)
        end = end.add(object.path.endPosition);

      const min = start.componentMin(end);
      const max = start.componentMax(end);

      if (min.x < 0)
        overflow.left = Math.max(overflow.left, -min.x);
      if (max.x > 512)
        overflow.right = Math.max(overflow.right, max.x - 512);

      if (min.y < 0)
        overflow.top = Math.max(overflow.top, -min.y);
      if (max.y > 384)
        overflow.bottom = Math.max(overflow.bottom, max.y - 384);
    }

    const offset = new Vec2();

    if (overflow.left && !overflow.right)
      offset.x = overflow.left;
    else if (overflow.right && !overflow.left)
      offset.x = -overflow.right;

    if (overflow.top && !overflow.bottom)
      offset.y = overflow.top;
    else if (overflow.bottom && !overflow.top)
      offset.y = -overflow.bottom;

    return delta.add(offset);
  }
}
