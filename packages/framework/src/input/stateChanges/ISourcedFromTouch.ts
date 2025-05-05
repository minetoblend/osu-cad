import type { TouchStateChangeEvent } from "./events/TouchStateChangeEvent";

export interface ISourcedFromTouch 
{
  readonly sourcedFromTouch: true;

  readonly touchEvent: TouchStateChangeEvent;
}

export function isSourcedFromTouch(obj: any): obj is ISourcedFromTouch 
{
  return !!(obj?.sourcedFromTouch);
}
