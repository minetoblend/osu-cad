import { Bindable, Vec2, dependencyLoader } from 'osucad-framework';
import type { OsuHitObject } from '../../beatmap/hitObjects/OsuHitObject';
import { DrawableHitObject } from './DrawableHitObject';

export class DrawableOsuHitObject<T extends OsuHitObject = OsuHitObject> extends DrawableHitObject {
  positionBindable = new Bindable(new Vec2());

  stackHeightBindable = new Bindable(0);

  scaleBindable = new Bindable(1);

  indexInComboBindable = new Bindable(0);

  get hitObject() {
    return super.hitObject as T | undefined;
  }

  @dependencyLoader()
  [Symbol('load')]() {
    this.dependencies.provide(DrawableOsuHitObject, this);
  }

  onApplied() {
    super.onApplied();

    this.positionBindable.bindTo(this.hitObject!.positionBindable);
    this.stackHeightBindable.bindTo(this.hitObject!.stackHeightBindable);
    this.scaleBindable.bindTo(this.hitObject!.scaleBindable);
    this.indexInComboBindable.bindTo(this.hitObject!.indexInComboBindable);
  }

  onFreed() {
    this.positionBindable.unbindFrom(this.hitObject!.positionBindable);
    this.stackHeightBindable.unbindFrom(this.hitObject!.stackHeightBindable);
    this.scaleBindable.unbindFrom(this.hitObject!.scaleBindable);
    this.indexInComboBindable.unbindFrom(this.hitObject!.indexInComboBindable);
  }

  get initialLifetimeOffset(): number {
    return this.hitObject!.timePreempt;
  }
}
