import { SerializedHitObject } from '../types';
import { HitObject } from './hitObject';
import { HitCircle } from './hitCircle';
import { Slider } from './slider';
import { Spinner } from './spinner';

export function deserializeHitObject(plain: SerializedHitObject): HitObject {
  switch (plain.type) {
    case 'circle':
      return new HitCircle(plain);
    case 'slider':
      return new Slider(plain);
    case 'spinner':
      return new Spinner(plain);
  }
}
