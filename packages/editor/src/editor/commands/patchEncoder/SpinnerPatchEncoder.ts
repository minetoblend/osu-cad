import type { Spinner } from '../../../beatmap/hitObjects/Spinner';
import type { SerializedSpinner } from '../../../beatmap/serialization/HitObjects';
import { OsuHitObjectPatchEncoder } from './OsuHitObjectPatchEncoder';

export class SpinnerPatchEncoder extends OsuHitObjectPatchEncoder<Spinner, SerializedSpinner> {
  encode(patch: SerializedSpinner, object: Spinner, key: keyof Spinner, value: any): boolean {
    if (super.encode(patch, object, key, value))
      return true;

    switch (key) {
      case 'duration':
        patch.duration = value;
        break;

      default:
        return false;
    }

    return true;
  }
}
