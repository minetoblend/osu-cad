import { Action } from "../bindables/Action";
import { AudioComponent } from "./AudioComponent";
import type { ITrack } from "./ITrack";

export abstract class Track extends AudioComponent implements ITrack
{
  public readonly completed = new Action();

  // TODO: actually loop
  public looping: boolean = false;

  public restartPoint: number = 0;

  readonly #gain: GainNode;

  public get output(): AudioNode
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

  public reset(): void
  {
    // TODO: this.volume.value = 1;

    this.resetSpeedAdjustments();

    this.stop();
    this.seek(0);
  }

  public restart(): void
  {
    this.stop();
    this.seek(this.restartPoint);
    this.start();
  }

  public abstract get currentTime(): number;

  public abstract get length(): number;

  public abstract seek(position: number): boolean;

  public abstract start(): void;

  public abstract stop(): void;

  public abstract get isRunning(): boolean;

  public abstract get rate(): number;

  public abstract set rate(value: number);

  public get isReversed(): boolean
  {
    return this.rate < 0;
  }

  public resetSpeedAdjustments(): void
  {
    this.rate = 1;
  }
}
