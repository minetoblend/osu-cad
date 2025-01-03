import type { HitObject } from '../HitObject';
import { Bindable } from 'osucad-framework';
import { LifetimeEntry } from '../../pooling/LifetimeEntry';

export class HitObjectLifetimeEntry extends LifetimeEntry {
  nestedEntries: HitObjectLifetimeEntry[] = [];

  readonly #startTimeBindable = new Bindable(0);

  constructor(readonly hitObject: HitObject) {
    super();

    this.#startTimeBindable.bindTo(hitObject.startTimeBindable);
    this.#startTimeBindable.valueChanged.addListener(this.setInitialLifetime, this);

    hitObject.defaultsApplied.addListener(this.setInitialLifetime, this);

    this.setInitialLifetime();
  }

  #realLifetimeStart = -Number.MAX_VALUE;

  #realLifetimeEnd = Number.MAX_VALUE;

  protected override setLifetimeStart(start: number) {
    this.#realLifetimeStart = start;
    if (!this.#keepAlive)
      super.setLifetimeStart(start);
  }

  protected override setLifetimeEnd(end: number) {
    this.#realLifetimeEnd = end;
    if (!this.#keepAlive)
      super.setLifetimeEnd(end);
  }

  #keepAlive = false;

  get keepAlive() {
    return this.#keepAlive;
  }

  set keepAlive(value) {
    if (this.#keepAlive === value)
      return;

    this.#keepAlive = value;
    if (this.keepAlive)
      this.setLifetime(-Number.MAX_VALUE, Number.MAX_VALUE);
    else
      this.setLifetime(this.#realLifetimeStart, this.#realLifetimeEnd);
  }

  get initialLifetimeOffset() {
    return 10000;
  }

  protected setInitialLifetime() {
    this.lifetimeStart = this.hitObject.startTime - this.initialLifetimeOffset;
  };

  dispose() {
    this.hitObject.defaultsApplied.removeListener(this.setInitialLifetime, this);
    this.#startTimeBindable.unbindAll();
  }
}
