import type { ISerializer } from '@osucad/multiplayer';
import type { IHitSound } from '../hitsounds/IHitSound';
import { HitSound } from '../hitsounds/HitSound';

export const hitsoundSerializer: ISerializer<HitSound, IHitSound> = {
  serialize(value: HitSound): IHitSound {
    return {
      sampleSet: value.sampleSet,
      additionSampleSet: value.additionSampleSet,
      additions: value.additions,
    };
  },
  deserialize(plain: IHitSound): HitSound {
    return new HitSound(
      plain.sampleSet,
      plain.additionSampleSet,
      plain.additions,
    );
  },
};
