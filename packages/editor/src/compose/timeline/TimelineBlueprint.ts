import type { HitObject } from "@osucad/core";
import { ISkinSource, PoolableDrawableWithLifetime } from "@osucad/core";
import type { MouseDownEvent } from "@osucad/framework";
import { Anchor, Axes, Bindable, MouseButton, provideSelf, resolved } from "@osucad/framework";
import { Color } from "pixi.js";
import { ComposeTimeline } from "./ComposeTimeline";
import type { TimelineLifetimeEntry } from "./TimelineLifetimeEntry";
import { HitObjectSelection } from "../HitObjectSelection";
import { EditorBeatmap } from "../../runtime";

@provideSelf()
export class TimelineBlueprint<T extends HitObject = HitObject> extends PoolableDrawableWithLifetime<TimelineLifetimeEntry>
{
  public static readonly SIZE = 70;

  public readonly selected = new Bindable(false);

  @resolved(() => ComposeTimeline)
  accessor #timeline!: ComposeTimeline

  @resolved(ISkinSource)
  accessor #skin!: ISkinSource

  @resolved(HitObjectSelection, true)
  protected accessor selection!: HitObjectSelection<HitObject> | undefined

  @resolved(EditorBeatmap)
  protected accessor beatmap!: EditorBeatmap

  public readonly accentColor = new Bindable(new Color(0xffffff));
  public readonly startTimeBindable = new Bindable(0);

  public constructor(entry: TimelineLifetimeEntry)
  {
    super(entry);

    this.relativePositionAxes = Axes.X;
    this.anchor = Anchor.CenterLeft;
    this.alwaysPresent = true;
  }

  protected override update(): void
  {
    super.update();

    this.alpha = this.hitObject.isAttached() ? 1 : 0;
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

  protected override onApply(entry: TimelineLifetimeEntry): void
  {
    super.onApply(entry);

    this.selected.bindTo(entry.selected);

    entry.hitObject.defaultsApplied.addListener(this.#defaultsApplied, this);
    this.#defaultsApplied();
  }

  protected override onFree(entry: TimelineLifetimeEntry): void
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

  protected override onMouseDown(e: MouseDownEvent): boolean
  {
    switch(e.button)
    {
    case MouseButton.Left:
      if (this.selection)
      {
        if (e.controlPressed)
        {
          this.selection.toggle(this.hitObject);
          return true;
        }

        if (!this.selected.value)
        {
          this.selection.clear();
          this.selection.add(this.hitObject);
          return true;
        }
      }
      break;
    case MouseButton.Right:
      this.beatmap.hitObjects.remove(this.hitObject);
      return true;
    }

    return super.onMouseDown(e);
  }

  public override dispose(): void
  {
    this.#skin.sourceChanged.removeListener(this.#skinChanged, this);

    super.dispose();
  }
}
