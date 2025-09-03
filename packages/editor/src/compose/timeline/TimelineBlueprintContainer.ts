import type { HitObject , HitObjectLifetimeEntry } from "@osucad/core";
import { PooledDrawableWithLifetimeContainer } from "@osucad/core";
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

  @resolved(HitObjectSelection)
  accessor #selection!: HitObjectSelection<HitObject>

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

    this.#selection.added.addListener(this.#hitObjectSelected, this);
    this.#selection.removed.addListener(this.#hitObjectDeselected, this);
  }

  #addHitObject(hitObject: HitObject)
  {
    const entry = new TimelineLifetimeEntry(hitObject);

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

  protected override addDrawable(entry: HitObjectLifetimeEntry, drawable: TimelineBlueprint<HitObject>): void
  {
    this.#content.add(drawable);
  }

  protected override removeDrawable(entry: HitObjectLifetimeEntry, drawable: TimelineBlueprint<HitObject>): void
  {
    this.#content.remove(drawable, false);
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

    this.#selection.added.removeListener(this.#hitObjectSelected, this);
    this.#selection.removed.removeListener(this.#hitObjectDeselected, this);

    super.dispose();
  }
}


