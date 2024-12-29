import type { OsuHitObject } from '@osucad/common';
import { Bindable, dependencyLoader, LoadState, PoolableDrawable, Vec2 } from 'osucad-framework';

export abstract class DrawableSelection<T extends OsuHitObject = OsuHitObject> extends PoolableDrawable {
  #hitObject: T | null = null;

  #hasEntryApplied = false;

  get hasEntryApplied() {
    return this.#hasEntryApplied;
  }

  get hitObject(): T {
    return this.#hitObject!;
  }

  set hitObject(value: T | null) {
    if (this.loadState === LoadState.NotLoaded)
      this.#hitObject = value;
    else if (value)
      this.#apply(value);
    else if (this.hasEntryApplied)
      this.#free();
  }

  #apply(hitObject: T) {
    if (this.hasEntryApplied)
      this.#free();

    this.#hitObject = hitObject;

    this.onApply(hitObject);

    this.#hasEntryApplied = true;
  }

  protected onApply(hitObject: T) {
    this.startTimeBindable.bindTo(hitObject.startTimeBindable);
    this.positionBindable.bindTo(hitObject.positionBindable);
    this.stackHeightBindable.bindTo(hitObject.stackHeightBindable);
    this.scaleBindable.bindTo(hitObject.scaleBindable);

    hitObject.defaultsApplied.addListener(this.onDefaultsApplied, this);
  }

  protected onDefaultsApplied() {
  }

  protected loadAsyncComplete() {
    super.loadAsyncComplete();

    if (this.#hitObject && !this.hasEntryApplied)
      this.#apply(this.#hitObject);
  }

  @dependencyLoader()
  [Symbol('load')]() {
    this.startTimeBindable.addOnChangeListener(() => this.scheduler.addOnce(this.updateDepth, this), { immediate: true });
  }

  protected updateDepth() {
    this.parent!.changeInternalChildDepth(this, this.startTimeBindable.value);
  }

  #free() {
    if (!this.hasEntryApplied)
      return;

    console.assert(this.#hitObject !== null, 'hitObject should not be null when hasEntryApplied is true');

    this.onFree(this.#hitObject!);

    this.#hitObject = null;
    this.#hasEntryApplied = false;
  }

  onFree(hitObject: OsuHitObject) {
    this.startTimeBindable.unbindFrom(hitObject.startTimeBindable);
    this.positionBindable.unbindFrom(hitObject.positionBindable);
    this.stackHeightBindable.unbindFrom(hitObject.stackHeightBindable);
    this.scaleBindable.unbindFrom(hitObject.scaleBindable);

    hitObject.defaultsApplied.removeListener(this.onDefaultsApplied);
  }

  protected startTimeBindable = new Bindable(0);
  protected positionBindable = new Bindable(new Vec2());
  protected stackHeightBindable = new Bindable(0);
  protected scaleBindable = new Bindable(0);
}
