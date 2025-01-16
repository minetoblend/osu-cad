import type { HitSound } from '../../hitsounds/HitSound';
import { SliderPath } from '../SliderPath';
import { ConvertHitObject } from './ConvertHitObject';

export class ConvertSlider extends ConvertHitObject {
  readonly path = new SliderPath();

  repeatCount = 0;

  hitSounds: HitSound[] = [];
}
