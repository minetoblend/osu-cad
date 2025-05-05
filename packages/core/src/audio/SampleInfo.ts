import type { ISampleInfo } from "./ISampleInfo";

export class SampleInfo implements ISampleInfo
{
  readonly sampleNames: string[];

  constructor(...sampleNames: string[])
  {
    this.sampleNames = sampleNames.sort();
  }

  get lookupNames()
  {
    return this.sampleNames;
  }

  get volume()
  {
    return 100;
  }

  public equals(other: ISampleInfo): boolean
  {
    if (!(other instanceof SampleInfo))
      return false;

    if (!this.sampleNames.every((name, index) => other.sampleNames[index] === name))
      return false;

    // noinspection RedundantIfStatementJS
    if (this.volume !== other.volume)
      return false;

    return true;
  }
}
