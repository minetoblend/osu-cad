import type { ISampleInfo } from "./ISampleInfo";

export class SampleInfo implements ISampleInfo
{
  public readonly sampleNames: string[];

  public constructor(...sampleNames: string[])
  {
    this.sampleNames = sampleNames.sort();
  }

  public get lookupNames()
  {
    return this.sampleNames;
  }

  public get volume()
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
