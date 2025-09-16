import type { FrameTimeInfo } from "./FrameTimeInfo";
import type { IClock } from "./IClock";

export interface IFrameBasedClock extends IClock
{
  readonly isFrameBasedClock: true;

  get elapsedFrameTime(): number;

  get framesPerSecond(): number;

  get timeInfo(): FrameTimeInfo;

  processFrame(): void;
}

export function isFrameBasedClock(clock: IClock): clock is IFrameBasedClock
{
  return (clock as Partial<IFrameBasedClock>).isFrameBasedClock === true;
}
