import type { SerializedSlider } from '../../../beatmap/serialization/HitObjects';
import type { Slider } from '../../../beatmap/hitObjects/Slider';
import type { PathPoint } from '../../../beatmap/hitObjects/PathPoint';
import { OsuHitObjectPatchEncoder } from './OsuHitObjectPatchEncoder';

export class SliderPatchEncoder extends OsuHitObjectPatchEncoder<Slider, SerializedSlider> {
  encode(patch: SerializedSlider, object: Slider, key: keyof Slider, value: any): boolean {
    if (super.encode(patch, object, key, value))
      return true;

    switch (key) {
      case 'repeatCount':
        patch.repeatCount = value;
        break;
      case 'velocityOverride':
        patch.velocityOverride = value;
        break;
      case 'expectedDistance':
        patch.expectedDistance = value;
        break;
      case 'controlPoints':
        patch.controlPoints = (value as PathPoint[]).map((it) => {
          return {
            position: { x: it.x, y: it.y },
            type: it.type,
          };
        });
        break;

      default:
        return false;
    }

    return true;
  }
}
