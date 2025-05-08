import type { Bindable } from "@osucad/framework";
import { type IFrameBasedClock, injectionToken } from "@osucad/framework";

export interface PlayfieldClock extends IFrameBasedClock
{
  readonly startTime: number

  readonly gameplayStartTime: number;

  readonly isPaused: Bindable<boolean>

  readonly isRewinding: boolean
}

export const PlayfieldClock = injectionToken<IFrameBasedClock>();
