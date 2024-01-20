export interface HitSound {
  sampleSet: SampleSet;
  additionSet: SampleSet;
  additions: Additions;
  index: number;
}

export interface HitSample {
  time: number;
  endTime?: number;
  volume: number;
  sampleSet: SampleSet;
  type: SampleType;
  index: number;
}

export const enum SampleSet {
  Auto = 0,
  Normal = 1,
  Soft = 2,
  Drum = 3,
}

export const enum SampleType {
  Normal = 0,
  Whistle = 1,
  Finish = 2,
  Clap = 3,
}

export const enum Additions {
  None = 0,
  Whistle = 1 << 0,
  Finish = 1 << 1,
  Clap = 1 << 2,
}

export function defaultHitSound(): HitSound {
  return {
    sampleSet: SampleSet.Auto,
    additionSet: SampleSet.Auto,
    additions: Additions.None,
    index: 0,
  };
}

export function getSamples(hitSound: HitSound, time: number): HitSample[] {
  const samples: HitSample[] = [
    {
      time,
      type: SampleType.Normal,
      sampleSet: hitSound.sampleSet,
      index: hitSound.index,
      volume: 1.0,
    }
  ];

  let additionSet = hitSound.additionSet;
  if(additionSet === SampleSet.Auto)
    additionSet = hitSound.sampleSet;

  if (hitSound.additions & Additions.Whistle) {
    samples.push({
      time,
      type: SampleType.Whistle,
      sampleSet: additionSet,
      index: hitSound.index,
      volume: 1.0,
    });
  }

  if (hitSound.additions & Additions.Finish) {
    samples.push({
      time,
      type: SampleType.Finish,
      sampleSet: additionSet,
      index: hitSound.index,
      volume: 1.0,
    });
  }

  if (hitSound.additions & Additions.Clap) {
    samples.push({
      time,
      type: SampleType.Clap,
      sampleSet: additionSet,
      index: hitSound.index,
      volume: 1.0,
    });
  }

  return samples;
}