import { SampleSet } from "./SampleSet";
import { SampleAdditions } from "./SampleAdditions";
import { HitSampleInfo } from "./HitSampleInfo";
import type { IBeatmapTiming } from "../beatmaps/timing/IBeatmapTiming";

export class HitSoundInfo
{
  constructor(
    readonly sampleSet: SampleSet = SampleSet.Normal,
    readonly additionSampleSet: SampleSet = SampleSet.Normal,
    readonly additions: SampleAdditions = SampleAdditions.None,
  )
  {
  }

  getSamples(time: number, timing: IBeatmapTiming): HitSampleInfo[]
  {
    const samples: HitSampleInfo[] = [];

    const sampleInfo = timing.getSampleInfoAt(time);

    const sampleSet = this.sampleSet !== SampleSet.None ? this.sampleSet : sampleInfo.sampleSet;
    const additionSampleSet = this.additionSampleSet !== SampleSet.None ? this.additionSampleSet : sampleSet;

    const suffix = sampleInfo.sampleIndex > 0 ? sampleInfo.sampleIndex.toString() : undefined;

    samples.push(new HitSampleInfo(HitSampleInfo.HIT_NORMAL, sampleSetToBank(sampleSet), suffix, sampleInfo.volume));

    if (this.additions & SampleAdditions.Whistle)
      samples.push(new HitSampleInfo(HitSampleInfo.HIT_WHISTLE, sampleSetToBank(additionSampleSet), suffix, sampleInfo.volume));

    if (this.additions & SampleAdditions.Finish)
      samples.push(new HitSampleInfo(HitSampleInfo.HIT_FINISH, sampleSetToBank(additionSampleSet), suffix, sampleInfo.volume));

    if (this.additions & SampleAdditions.Clap)
      samples.push(new HitSampleInfo(HitSampleInfo.HIT_CLAP, sampleSetToBank(additionSampleSet), suffix, sampleInfo.volume));

    return samples;
  }
}

export function sampleSetToBank(sampleSet: SampleSet)
{
  switch (sampleSet)
  {
  case SampleSet.Normal:
    return HitSampleInfo.BANK_NORMAL;
  case SampleSet.Soft:
    return HitSampleInfo.BANK_SOFT;
  case SampleSet.Drum:
    return HitSampleInfo.BANK_DRUM;
  default:
    return HitSampleInfo.BANK_NORMAL;
  }
}
