import type { IClock } from "./IClock";

export class OffsetClock implements IClock
{
  public constructor(
    public readonly underlyingClock: IClock,
    public offset = 0,
  )
  {
  }

  public get currentTime(): number
  {
    return this.underlyingClock.currentTime + this.offset;
  }

  public get rate(): number
  {
    return this.underlyingClock.rate;
  }

  public get isRunning(): boolean
  {
    return this.underlyingClock.isRunning;
  }
}
