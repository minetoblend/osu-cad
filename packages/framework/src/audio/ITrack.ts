import type { Action } from "../bindables/Action";
import type { IAdjustableClock } from "../timing/IAdjustableClock";
import type { IAudioSource } from "./IAudioSource";

export interface ITrack extends IAudioSource, IAdjustableClock
{
  readonly completed: Action;

  looping: boolean;

  restartPoint: number;

  length: number;

  hasCompleted: boolean;

  restart(): void;
}
