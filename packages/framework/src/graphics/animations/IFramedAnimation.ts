import type { IAnimation } from "./IAnimation";

export interface IFramedAnimation extends IAnimation
{
  get frameCount(): number;

  get currentFrameIndex(): number;

  gotoFrame: (frameIndex: number) => void;
}
