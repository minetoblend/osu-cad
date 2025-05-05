import type { FrameTimeInfo } from "./FrameTimeInfo";
import type { IClock } from "./IClock";

export interface IFrameBasedClock extends IClock 
{
  get elapsedFrameTime(): number;

  get framesPerSecond(): number;

  get timeInfo(): FrameTimeInfo;

  processFrame(): void;

  isFrameBasedClock: true;
}

export function isFrameBasedClock(clock: IClock): clock is IFrameBasedClock 
{
  return (clock as IFrameBasedClock).isFrameBasedClock;
}
