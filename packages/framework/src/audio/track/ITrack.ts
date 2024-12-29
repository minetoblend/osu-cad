import type { Action } from '../../bindables';
import type { IAdjustableClock } from '../../timing';

export interface ITrack extends IAdjustableClock {
  readonly completed: Action;

  looping: boolean;

  restartPoint: number;

  length: number;

  hasCompleted: boolean;

  restart: () => void;
}
