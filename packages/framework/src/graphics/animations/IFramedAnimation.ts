import type { IAnimation } from './IAnimation.ts';

export interface IFramedAnimation extends IAnimation {
  get frameCount(): number;

  get currentFrameIndex(): number;

  gotoFrame: (frameIndex: number) => void;
}
