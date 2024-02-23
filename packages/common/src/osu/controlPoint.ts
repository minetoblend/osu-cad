import {hitObjectId} from "./hitObject";
import {Action} from "../util/action";

export class ControlPoint {
  static default = new ControlPoint({
    id: '',
    time: 0,
    timing: {
      beatLength: 60_000 / 120,
    },
    velocityMultiplier: 1,
  })

  constructor(options: SerializedControlPoint) {
    this._id = options.id;
    this._time = options.time;
    this._timing = options.timing ?? null;
    this._velocityMultiplier = options.velocityMultiplier ?? null;
  }

  private _id: string = hitObjectId()
  private _time: number = 0
  private _timing: TimingInfo | null
  private _velocityMultiplier: number | null
  private _updatesPaused = false

  onUpdate = new Action<[ControlPoint, ControlPointUpdateFlags]>();

  private _dirtyFlags: ControlPointUpdateFlags = 0;

  get id(): string {
    return this._id;
  }

  get time(): number {
    return this._time;
  }

  set time(value: number) {
    this._time = value;
    this._markDirty(ControlPointUpdateFlags.Timing);
  }

  get timing(): TimingInfo | null {
    return this._timing;
  }

  set timing(value: TimingInfo | null) {
    this._timing = value;
    this._markDirty(ControlPointUpdateFlags.Timing);
  }

  get velocityMultiplier(): number | null {
    return this._velocityMultiplier;
  }

  set velocityMultiplier(value: number | null) {
    this._velocityMultiplier = value;
    this._markDirty(ControlPointUpdateFlags.Velocity);
  }

  patch(update: Partial<SerializedControlPoint>) {
    this._updatesPaused = true;
    if (update.time !== undefined) this.time = update.time;
    if (update.timing !== undefined) this.timing = update.timing;
    if (update.velocityMultiplier !== undefined) this.velocityMultiplier = update.velocityMultiplier;
    this._updatesPaused = false;
    this._notifyUpdate();
  }

  serialize(): SerializedControlPoint {
    return {
      id: this.id,
      time: this.time,
      timing: this.timing,
      velocityMultiplier: this.velocityMultiplier,
    };
  }

  destroy() {
    this.onUpdate.removeListeners()
  }

  _markDirty(flags: ControlPointUpdateFlags) {
    this._dirtyFlags |= flags;
    if (!this._updatesPaused) {
      this._notifyUpdate();
    }
  }

  _notifyUpdate() {
    this.onUpdate.emit(this, this._dirtyFlags);
    this._dirtyFlags = 0;
  }

  _inTimingList = false
  _inVelocityList = false

}

export interface SerializedControlPoint {
  id: string
  time: number
  timing: TimingInfo | null
  velocityMultiplier: number | null
}

export interface TimingInfo {
  beatLength: number
}

export const enum ControlPointUpdateFlags {
  None = 0,
  StartTime = 1 << 0,
  Timing = 1 << 1,
  Velocity = 1 << 2,
  All = StartTime | Timing | Velocity,
}