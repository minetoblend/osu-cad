import type { OsuHitObject } from "../OsuHitObject";
import { LifetimeEntry } from "@osucad/core";
import { Action } from "@osucad/framework";
import { Spinner } from "../Spinner";
import { FollowPointConnection } from "./FollowPointConnection";

let uid = 0;

export class FollowPointLifetimeEntry extends LifetimeEntry 
{
  readonly invalidated = new Action();
  readonly start: OsuHitObject;

  constructor(start: OsuHitObject) 
  {
    super();

    this.start = start;
  }

  uid = uid++;

  #end: OsuHitObject | null = null;

  get end() 
  {
    return this.#end;
  }

  set end(value) 
  {
    this.unbindEvents();

    this.#end = value;

    this.#bindEvents();

    this.#refreshLifetimes();
  }

  #wasBound = false;

  #bindEvents() 
  {
    this.unbindEvents();

    if (!this.end)
      return;

    // this.start.defaultsApplied.addListener(this.#onDefaultsApplied, this);
    this.start.positionBindable.valueChanged.addListener(this.#onPositionChanged, this);

    // this.end!.defaultsApplied.addListener(this.#onEndDefaultsApplied, this);
    this.end!.positionBindable.valueChanged.addListener(this.#onEndPositionChanged, this);
    this.end!.newComboBindable.valueChanged.addListener(this.#onEndDefaultsApplied, this);

    this.#wasBound = true;
  }

  unbindEvents() 
  {
    if (!this.#wasBound)
      return;

    console.assert(this.end !== null);

    // this.start.defaultsApplied.removeListener(this.#onDefaultsApplied, this);
    this.start.positionBindable.valueChanged.removeListener(this.#onPositionChanged, this);

    // this.end!.defaultsApplied.removeListener(this.#onEndDefaultsApplied, this);
    this.end!.positionBindable.valueChanged.removeListener(this.#onEndPositionChanged, this);
    this.end!.newComboBindable.valueChanged.removeListener(this.#onEndDefaultsApplied, this);

    this.#wasBound = false;
  }

  // #onDefaultsApplied() {
  //   this.#refreshLifetimes();
  // }

  #onEndDefaultsApplied() 
  {
    this.#refreshLifetimes();
  }

  #onPositionChanged() 
  {
    this.#refreshLifetimes();
  }

  #onEndPositionChanged() 
  {
    this.#refreshLifetimes();
  }

  #refreshLifetimes() 
  {
    if (this.end === null || this.end.newCombo || this.start instanceof Spinner || this.end instanceof Spinner) 
    {
      this.lifetimeEnd = this.lifetimeStart;
      return;
    }

    if (this.start.endTime === this.end.startTime) 
    {
      this.lifetimeEnd = this.lifetimeStart;
      return;
    }

    const startPosition = this.start.stackedEndPosition;
    const endPosition = this.end.stackedPosition;
    const distanceVector = endPosition.sub(startPosition);

    const fraction = Math.floor(FollowPointConnection.SPACING * 1.5) / distanceVector.length();
    const { fadeInTime } = FollowPointConnection.getFadeTimes(this.start, this.end!, fraction);

    this.lifetimeStart = fadeInTime;
    this.lifetimeEnd = this.end.startTime + 2000;

    this.invalidated.emit();
  }
}
