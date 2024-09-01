import type { OsuHitObject } from '../../../beatmap/hitObjects/OsuHitObject';
import type { SerializedOsuHitObject } from '../../../beatmap/serialization/HitObjects';
import { PatchEncoder } from './PatchEncoder';

export class OsuHitObjectPatchEncoder<TObject extends OsuHitObject, TPatch extends SerializedOsuHitObject> extends PatchEncoder<TObject, TPatch> {
  encode(patch: TPatch, object: TObject, key: keyof TObject, value: any): boolean {
    switch (key) {
      case 'startTime':
        patch.startTime = value;
        break;
      case 'newCombo':
        patch.newCombo = value;
        break;
      case 'comboOffset':
        patch.comboOffset = value;
        break;
      case 'position':
        patch.position = { x: value.x, y: value.y };
        break;
      case 'x':
        patch.position = { x: value, y: patch.position?.y ?? object.y };
        break;
      case 'y':
        patch.position = { x: patch.position?.x ?? object.x, y: value };
        break;

      default:
        return false;
    }

    return true;
  }
}
