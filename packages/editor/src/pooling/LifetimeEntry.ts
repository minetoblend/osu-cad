import { Action } from 'osucad-framework';
import { LifetimeEntryState } from './LifetimeEntryState';

export class LifetimeEntry {
  #lifetimeStart = Number.MIN_VALUE;

  #lifetimeEnd = Number.MAX_VALUE;

  get lifetimeStart() {
    return this.#lifetimeStart;
  }

  set lifetimeStart(value: number) {
    this.setLifetimeStart(value);
  }

  get lifetimeEnd() {
    return this.#lifetimeEnd;
  }

  set lifetimeEnd(value: number) {
    this.setLifetimeEnd(value);
  }

  state: LifetimeEntryState = LifetimeEntryState.New;

  childId: number = 0;

  requestLifetimeUpdate = new Action<LifetimeEntry>();

  lifetimeChanged = new Action<LifetimeEntry>();

  protected setLifetimeStart(start: number) {
    if (start !== this.#lifetimeStart) {
      this.setLifetime(start, this.#lifetimeEnd);
    }
  }

  protected setLifetimeEnd(end: number) {
    if (end !== this.#lifetimeEnd) {
      this.setLifetime(this.#lifetimeStart, end);
    }
  }

  protected setLifetime(start: number, end: number) {
    this.requestLifetimeUpdate.emit(this);
    this.#lifetimeStart = start;
    this.#lifetimeEnd = end;
    this.lifetimeChanged.emit(this);
  }
}
