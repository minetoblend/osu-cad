import type { Bindable } from "@osucad/framework";
import { injectionToken } from "@osucad/framework";
import type { TimingControlPoint } from "@osucad/core";

export interface IBeatSyncProvider
{
  activeTimingPoint: Bindable<TimingControlPoint>

  readonly beatProgress: number
  readonly beatIndex: number
  readonly currentTime: number
}

export const IBeatSyncProvider = injectionToken<IBeatSyncProvider>("IBeatSyncProvider");
