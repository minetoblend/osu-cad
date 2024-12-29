import type { FrameTimeInfo } from '../../timing';
import type { IUsable } from '../../types/IUsable';
import type { Transform } from './Transform';

export interface ITransformable {
  beginDelayedSequence: (delay: number, recursive?: boolean) => IUsable;

  beginAbsoluteSequence: (newTransformStartTime: number, recursive?: boolean) => IUsable;

  get time(): FrameTimeInfo;

  get transformStartTime(): number;

  addTransform: (transform: Transform, customTransformID?: number) => void;

  removeTransform: (toRemove: Transform) => void;
}
