import type { HitObject, HitObjectLifetimeEntry } from "@osucad/core";
import { ISkinSource, PoolableDrawableWithLifetime } from "@osucad/core";
import { Anchor, Axes, Bindable, provideSelf, resolved } from "@osucad/framework";
import { ComposeTimeline } from "./ComposeTimeline";
import { Color } from "pixi.js";

@provideSelf()
export class TimelineBlueprint<T extends HitObject = HitObject> extends PoolableDrawableWithLifetime<HitObjectLifetimeEntry>
{
  public static readonly SIZE = 60;

  @resolved(() => ComposeTimeline)
  accessor #timeline!: ComposeTimeline

  @resolved(ISkinSource)
  accessor #skin!: ISkinSource

  public readonly accentColor = new Bindable(new Color(0xffffff));
  public readonly startTimeBindable = new Bindable(0);

  public constructor(entry: HitObjectLifetimeEntry)
  {
    super(entry);

    this.relativePositionAxes = Axes.X;
    this.anchor = Anchor.CenterLeft;
  }

  protected get hitObject(): T
  {
    return this.entry!.hitObject as T;
  }

  protected override loadComplete(): void
  {
    super.loadComplete();

    this.#skin.sourceChanged.addListener(this.#skinChanged, this);
    this.updateComboColor();
  }

  protected override onApply(entry: HitObjectLifetimeEntry): void
  {
    super.onApply(entry);


    entry.hitObject.defaultsApplied.addListener(this.#defaultsApplied, this);
    this.#defaultsApplied();
  }

  protected override onFree(entry: HitObjectLifetimeEntry): void
  {
    super.onFree(entry);

    entry.hitObject.defaultsApplied.removeListener(this.#defaultsApplied, this);
  }

  #defaultsApplied()
  {
    this.x = this.hitObject.startTime;

    this.defaultsApplied();
  }

  protected defaultsApplied()
  {
  }

  #skinChanged()
  {
    this.scheduler.addOnce(this.updateComboColor, this);
  }

  protected updateComboColor()
  {

  }

  public override get shouldBeAlive(): boolean
  {
    return true;
  }

  public override dispose(): void
  {
    this.#skin.sourceChanged.removeListener(this.#skinChanged, this);

    super.dispose();
  }
}
