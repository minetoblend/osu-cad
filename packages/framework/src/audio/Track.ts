import { Action } from "../bindables/Action";
import { AudioComponent } from "./AudioComponent";
import type { ITrack } from "./ITrack";

export abstract class Track extends AudioComponent implements ITrack
{
  readonly completed = new Action();

  // TODO: actually loop
  public looping: boolean = false;

  public restartPoint: number = 0;

  readonly #gain: GainNode;

  get output(): AudioNode
  {
    return this.#gain;
  }

  public override get hasCompleted(): boolean
  {
    return false;
  }

  protected constructor(name: string, context: AudioContext)
  {
    super(name);

    this.#gain = new GainNode(context);
  }

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
}
