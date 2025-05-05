export interface ISampleInfo
{
  readonly lookupNames: string[];
  readonly volume: number;

  equals(other: ISampleInfo): boolean;
}

