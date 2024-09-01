import { Action } from 'osucad-framework';
import { LifetimeEntry } from '../../pooling/LifetimeEntry';
import type { OsuHitObject } from '../../beatmap/hitObjects/OsuHitObject';
import { Spinner } from '../../beatmap/hitObjects/Spinner';
import { FollowPointConnection } from './FollowPointConnection';

export class FollowPointLifetimeEntry extends LifetimeEntry {
  readonly invalidated = new Action();
  readonly start: OsuHitObject;

  constructor(start: OsuHitObject) {
    super();

    this.start = start;
  }

  #end: OsuHitObject | null = null;

  get end() {
    return this.#end;
  }

  set end(value) {
    this.unbindEvents();

    this.#end = value;

    this.#bindEvents();

    this.#refreshLifetimes();
  }

  #wasBound = false;

  #bindEvents() {
    this.unbindEvents();

    if (!this.#end)
      return;

    this.start.defaultsApplied.addListener(this.#onDefaultsApplied, this);
    this.start.positionBindable.valueChanged.addListener(this.#onPositionChanged, this);
    this.#end.defaultsApplied.addListener(this.#onDefaultsApplied, this);
    this.#end.positionBindable.valueChanged.addListener(this.#onPositionChanged, this);

    this.#wasBound = true;
  }

  unbindEvents() {
    if (!this.#wasBound)
      return;

    console.assert(this.end !== null);

    this.start.defaultsApplied.removeListener(this.#onDefaultsApplied);
    this.start.positionBindable.removeOnChangeListener(this.#onPositionChanged);

    this.end!.defaultsApplied.removeListener(this.#onDefaultsApplied);
    this.end!.positionBindable.removeOnChangeListener(this.#onPositionChanged);

    this.#wasBound = false;
  }

  #onDefaultsApplied() {
    this.#refreshLifetimes();
  }

  #onPositionChanged() {
    this.#refreshLifetimes();
  }

  #refreshLifetimes() {
    if (this.end === null || this.end.newCombo || this.start instanceof Spinner || this.end instanceof Spinner) {
      this.lifetimeEnd = this.lifetimeStart;
      return;
    }

    const startPosition = this.start.stackedEndPosition;
    const endPosition = this.end.stackedPosition;
    const distanceVector = endPosition.sub(startPosition);

    const fraction = Math.floor(FollowPointConnection.SPACING * 1.5) / distanceVector.length();
    const { fadeInTime } = FollowPointConnection.getFadeTimes(this.start, this.end!, fraction);

    this.lifetimeStart = fadeInTime;
    this.lifetimeEnd = Number.MAX_VALUE;

    this.invalidated.emit();
  }
}
