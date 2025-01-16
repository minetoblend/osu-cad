import { Vec2 } from '@osucad/framework';
import { HitSound } from '../../hitsounds/HitSound';
import { HitObject } from '../HitObject';

export class ConvertHitObject extends HitObject {
  override isVisibleAtTime(time: number): boolean {
    return false;
  }

  position = new Vec2();

  newCombo = false;

  comboOffset = 0;

  hitSound = new HitSound();
}
