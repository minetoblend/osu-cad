import type { HitCircle } from '../../../beatmap/hitObjects/HitCircle';
import type { SerializedHitCircle } from '../../../beatmap/serialization/HitObjects';
import { OsuHitObjectPatchEncoder } from './OsuHitObjectPatchEncoder';

export class HitCirclePatchEncoder extends OsuHitObjectPatchEncoder<HitCircle, SerializedHitCircle> {
}
