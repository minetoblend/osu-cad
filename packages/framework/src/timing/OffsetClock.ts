import type { IClock } from "./IClock";

export class OffsetClock implements IClock 
{
  constructor(
    readonly underlyingClock: IClock,
    public offset = 0,
  ) 
  {}

  get currentTime(): number 
  {
    return this.underlyingClock.currentTime + this.offset;
  }

  get rate(): number 
  {
    return this.underlyingClock.rate;
  }

  get isRunning(): boolean 
  {
    return this.underlyingClock.isRunning;
  }
}
