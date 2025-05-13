import type { IDisposable } from "../../types";
import type { ITrack } from "./ITrack";
import { Action } from "../../bindables";
import type { IClock } from "../../timing/IClock";

export abstract class Track implements ITrack, IDisposable, IClock
{
  completed = new Action();

  looping: boolean = false;

  restartPoint: number = 0;

  hasCompleted: boolean = false;

  protected raiseCompleted()
  {
    this.completed.emit();
  }

  reset(): void
  {
    // TODO: this.volume.value = 1;

    this.resetSpeedAdjustments();

    this.stop();
    this.seek(0);
  }

  restart(): void
  {
    this.stop();
    this.seek(this.restartPoint);
    this.start();
  }

  abstract get currentTime(): number;

  abstract get length(): number;

  abstract seek(position: number): boolean;

  abstract start(): void;

  abstract stop(): void;

  abstract get isRunning(): boolean;

  abstract get rate(): number;

  abstract set rate(value: number);

  get isReversed(): boolean
  {
    return this.rate < 0;
  }

  resetSpeedAdjustments(): void
  {
    this.rate = 1;
  }

  abstract dispose(): void;
}
