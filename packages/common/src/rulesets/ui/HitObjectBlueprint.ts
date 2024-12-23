import type { HitObjectLifetimeEntry } from '../../hitObjects/drawables/HitObjectLifetimeEntry';
import type { HitObject } from '../../hitObjects/HitObject';
import { BindableNumber } from 'osucad-framework';
import { PoolableDrawableWithLifetime } from '../../pooling/PoolableDrawableWithLifetime';

export abstract class HitObjectBlueprint extends PoolableDrawableWithLifetime<HitObjectLifetimeEntry> {
  get hitObject() {
    return this.entry?.hitObject;
  }

  onKilled() {}

  readonly startTimeBindable = new BindableNumber();

  protected override onApply(entry: HitObjectLifetimeEntry) {
    super.onApply(entry);

    this.startTimeBindable.bindTo(entry.hitObject.startTimeBindable);

    entry.hitObject.defaultsApplied.addListener(this.onDefaultsApplied, this);
  }

  protected override onFree(entry: HitObjectLifetimeEntry) {
    super.onFree(entry);

    this.startTimeBindable.unbindFrom(entry.hitObject.startTimeBindable);

    entry.hitObject.defaultsApplied.removeListener(this.onDefaultsApplied, this);
  }

  protected onDefaultsApplied(hitObject: HitObject) {}
}
