import { hitObjectId } from './hitObject';
import { SampleSet, SampleType } from './hitSound';
import { HitSoundSample, SerializedHitSoundSample } from './hitSound2';

export class HitSoundLayer {
  constructor(options: SerializedHitSoundLayer) {
    this.id = options.id ?? hitObjectId();
    this.name = options.name;
    this.sampleSet = options.sampleSet;
    this.type = options.type;
    this.customFilename = options.customFilename;
    this.samples =
      options.samples?.map((sample) => new HitSoundSample(sample)) ?? [];
    this.enabled = options.enabled;
    this.volume = options.volume;
  }

  patch(options: Partial<SerializedHitSoundLayer>) {
    if (options.name !== undefined) this.name = options.name;
    if (options.sampleSet !== undefined) this.sampleSet = options.sampleSet;
    if (options.type !== undefined) this.type = options.type;
    if (options.customFilename !== undefined)
      this.customFilename = options.customFilename;
    if (options.enabled !== undefined) this.enabled = options.enabled;
    if (options.volume !== undefined) this.volume = options.volume;
  }

  id: string = hitObjectId();
  name: string | null;
  sampleSet: SampleSet;
  type: SampleType;
  customFilename: string | null;
  samples: HitSoundSample[];
  enabled: boolean;
  volume: number;

  serialize(): SerializedHitSoundLayer {
    return {
      id: this.id,
      name: this.name,
      sampleSet: this.sampleSet,
      type: this.type,
      customFilename: this.customFilename,
      samples: this.samples,
      enabled: this.enabled,
      volume: this.volume,
    };
  }
}

export interface SerializedHitSoundLayer {
  id?: string;
  name: string | null;
  sampleSet: SampleSet;
  type: SampleType;
  customFilename: string | null;
  samples: SerializedHitSoundSample[];
  enabled: boolean;
  volume: number;
}
