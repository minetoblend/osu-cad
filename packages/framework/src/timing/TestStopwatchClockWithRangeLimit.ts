import { clamp } from "../utils/clamp";
import { StopwatchClock } from "./StopwatchClock";

export class TestStopwatchClockWithRangeLimit extends StopwatchClock
{
  public get minTime()
  {
    return 0;
  }

  public maxTime = Number.POSITIVE_INFINITY;

  public constructor()
  {
    super(true);
  }

  public override get currentTime(): number
  {
    const currentTime = super.currentTime;
    const clamped = clamp(currentTime, this.minTime, this.maxTime);

    if (clamped === currentTime)
      return clamped;

    if ((this.rate > 0 && clamped == this.maxTime) || (this.rate < 0 && clamped == this.minTime))
      this.stop();

    return clamped;
  }

  public override seek(position: number): boolean
  {
    const clamped = clamp(position, this.minTime, this.maxTime);

    if (clamped !== position)
    {
      if (position >= this.maxTime)
        this.stop();
      this.seek(clamped);
      return false;
    }

    return super.seek(position);
  }
}
