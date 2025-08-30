import type { HitObjectLifetimeEntry } from "@osucad/core";
import { ISkinSource } from "@osucad/core";
import { TimelineBlueprint } from "@osucad/editor";
import { Bindable, provideSelf, resolved } from "@osucad/framework";
import type { OsuHitObject } from "../../hitObjects";

@provideSelf()
export class OsuTimelineBlueprint<T extends OsuHitObject = OsuHitObject> extends TimelineBlueprint<T>
{
  @resolved(ISkinSource)
  accessor #skin!: ISkinSource;

  public readonly comboIndexBindable = new Bindable(0);
  public readonly indexInComboBindable = new Bindable(0);

  public constructor(entry: HitObjectLifetimeEntry)
  {
    super(entry);
  }

  protected override onApply(entry: HitObjectLifetimeEntry): void
  {
    super.onApply(entry);

    this.comboIndexBindable.bindTo(this.hitObject.comboIndexBindable);
    this.indexInComboBindable.bindTo(this.hitObject.indexInComboBindable);
    this.updateComboColor();
  }

  protected override onFree(entry: HitObjectLifetimeEntry): void
  {
    super.onFree(entry);

    this.comboIndexBindable.unbindFrom(this.hitObject.comboIndexBindable);
    this.indexInComboBindable.unbindFrom(this.hitObject.indexInComboBindable);
  }

  protected override loadComplete(): void
  {
    super.loadComplete();

    this.comboIndexBindable.bindValueChanged(this.updateComboColor, this);
  }

  protected override updateComboColor(): void
  {
    this.accentColor.value = this.#skin.getComboColor(this.comboIndexBindable.value);
  }

  protected override defaultsApplied(): void
  {

  }
}
