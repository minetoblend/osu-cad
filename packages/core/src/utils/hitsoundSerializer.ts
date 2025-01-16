import type { ISerializer } from '@osucad/multiplayer';
import type { Additions } from '../hitsounds/Additions';
import type { SampleSet } from '../hitsounds/SampleSet';
import { HitSound } from '../hitsounds/HitSound';

export const hitsoundSerializer: ISerializer<HitSound, [SampleSet, SampleSet, Additions]> = {
  serialize(value: HitSound): [SampleSet, SampleSet, Additions] {
    return [value.sampleSet, value.additionSampleSet, value.additions];
  },
  deserialize(plain: [SampleSet, SampleSet, Additions]): HitSound {
    return new HitSound(plain[0], plain[1], plain[2]);
  },
};
