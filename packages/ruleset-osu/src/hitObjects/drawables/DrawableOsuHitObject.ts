import { DrawableHitObject, IComboNumberReference, ISkinSource } from "@osucad/core";
import { Bindable, provide, resolved, Vec2 } from "@osucad/framework";
import type { OsuHitObject } from "../OsuHitObject";

@provide(IComboNumberReference)
export abstract class DrawableOsuHitObject<out T extends OsuHitObject = OsuHitObject>
  extends DrawableHitObject<T>
  implements IComboNumberReference
{
  readonly positionBindable = new Bindable(Vec2.zero());
  readonly scaleBindable = new Bindable(1);
  readonly indexInComboBindable = new Bindable(0);
  readonly comboIndexBindable = new Bindable(0);
  readonly stackHeightBindable = new Bindable(0);

  protected override onApplied()
  {
    super.onApplied();

    this.positionBindable.bindTo(this.hitObject.positionBindable);
    this.scaleBindable.bindTo(this.hitObject.scaleBindable);
    this.indexInComboBindable.bindTo(this.hitObject.indexInComboBindable);
    this.comboIndexBindable.bindTo(this.hitObject.comboIndexBindable);
    this.stackHeightBindable.bindTo(this.hitObject.stackHeightBindable);
  }

  protected override onFreed()
  {
    super.onFreed();

    this.positionBindable.unbindFrom(this.hitObject.positionBindable);
    this.scaleBindable.unbindFrom(this.hitObject.scaleBindable);
    this.indexInComboBindable.unbindFrom(this.hitObject.indexInComboBindable);
    this.comboIndexBindable.unbindFrom(this.hitObject.comboIndexBindable);
    this.stackHeightBindable.unbindFrom(this.hitObject.stackHeightBindable);
  }

  protected override loadAsyncComplete()
  {
    super.loadAsyncComplete();

    this.positionBindable.bindValueChanged(() => this.updatePosition());
    this.stackHeightBindable.bindValueChanged(() => this.updatePosition());
    this.scaleBindable.bindValueChanged(() => this.updateScale());
    this.indexInComboBindable.bindValueChanged(() => this.scheduler.addOnce(this.updateComboColor, this));
  }

  protected abstract updatePosition(): void;

  protected abstract updateScale(): void;

  @resolved(ISkinSource)
  protected skin!: ISkinSource;

  protected override updateComboColor()
  {
    this.accentColor.value = this.skin.getComboColor(this.comboIndexBindable.value);
  }
}
