import type { HitObject } from "@osucad/core";
import { PooledDrawableWithLifetimeContainer } from "@osucad/core";
import type { Bindable } from "@osucad/framework";
import { Axes, dependencyLoader, resolved } from "@osucad/framework";
import { EditorClock } from "../../EditorClock";
import { EditorBeatmap } from "../../runtime";
import { ComposeTimeline } from "./ComposeTimeline";
import type { TimelineBlueprint } from "./TimelineBlueprint";
import { TimelinePart } from "./TimelinePart";
import { HitObjectSelection } from "../HitObjectSelection";
import { TimelineLifetimeEntry } from "./TimelineLifetimeEntry";

export abstract class TimelineBlueprintContainer extends PooledDrawableWithLifetimeContainer<TimelineLifetimeEntry, TimelineBlueprint>
{
  readonly #entryMap = new Map<HitObject, TimelineLifetimeEntry>();

  @resolved(EditorBeatmap)
  accessor #beatmap!: EditorBeatmap

  @resolved(EditorClock)
  accessor #editorClock!: EditorClock

  @resolved(() => ComposeTimeline)
  accessor #timeline!: ComposeTimeline

  @resolved(HitObjectSelection, true)
  accessor #selection!: HitObjectSelection<HitObject> | undefined

  readonly #content: TimelinePart<TimelineBlueprint>;

  protected constructor()
  {
    super();

    this.relativeSizeAxes = Axes.Both;
    this.padding = { vertical: 5 };

    this.addInternal(this.#content = new TimelinePart());
  }

  @dependencyLoader()
  #load()
  {
    this.clock = this.#editorClock;
  }

  protected override loadComplete(): void
  {
    super.loadComplete();

    for (const h of this.#beatmap.hitObjects)
      this.#addHitObject(h);

    this.#beatmap.hitObjects.added.addListener(this.#addHitObject, this);
    this.#beatmap.hitObjects.removed.addListener(this.#removeHitObject, this);

    this.#selection?.added.addListener(this.#hitObjectSelected, this);
    this.#selection?.removed.addListener(this.#hitObjectDeselected, this);
  }

  #addHitObject(hitObject: HitObject)
  {
    const entry = new TimelineLifetimeEntry(hitObject);

    if (this.#selection)
      entry.selected.value = this.#selection.has(hitObject);

    this.#entryMap.set(hitObject, entry);
    this.addEntry(entry);
  }

  #removeHitObject(hitObject: HitObject)
  {
    const entry = this.#entryMap.get(hitObject);
    if (!entry)
      return;

    this.#entryMap.delete(hitObject);

    this.removeEntry(entry);
  }

  #hitObjectSelected(hitObject: HitObject)
  {
    const entry = this.#entryMap.get(hitObject);
    if (entry)
      entry.selected.value = true;
  }

  #hitObjectDeselected(hitObject: HitObject)
  {
    const entry = this.#entryMap.get(hitObject);
    if (entry)
      entry.selected.value = false;
  }

  protected override addDrawable(entry: TimelineLifetimeEntry, drawable: TimelineBlueprint<HitObject>): void
  {
    this.#content.add(drawable);
    this.#bindStartTime(entry, drawable);
  }

  protected override removeDrawable(entry: TimelineLifetimeEntry, drawable: TimelineBlueprint<HitObject>): void
  {
    this.#content.remove(drawable, false);
    this.#unbindStartTime(entry);
  }

  readonly #startTimeMap = new Map<TimelineLifetimeEntry, Bindable<number>>;

  #bindStartTime(entry: TimelineLifetimeEntry, drawable: TimelineBlueprint<HitObject>)
  {
    const startTime = entry.hitObject.startTimeBindable.getBoundCopy();
    startTime.bindValueChanged(e =>
    {
      this.#content.changeChildDepth(drawable, e.value);
    }, true);

    this.#startTimeMap.set(entry, startTime);
  }

  #unbindStartTime(entry: TimelineLifetimeEntry)
  {
    const bindable = this.#startTimeMap.get(entry);
    if (bindable)
    {
      this.#startTimeMap.delete(entry);
      bindable.unbindAll();
    }
  }

  protected override update(): void
  {
    super.update();

    this.pastLifetimeExtension = this.futureLifetimeExtension = this.#timeline.visibleDuration / 2 + 100 / this.#timeline.zoom;
  }

  public override dispose(): void
  {
    this.#beatmap.hitObjects.added.removeListener(this.#addHitObject, this);
    this.#beatmap.hitObjects.removed.removeListener(this.#removeHitObject, this);

    this.#selection?.added.removeListener(this.#hitObjectSelected, this);
    this.#selection?.removed.removeListener(this.#hitObjectDeselected, this);

    super.dispose();
  }
}


