import type { HitObject } from "@osucad/core";
import { HitObjectLifetimeEntry, PooledDrawableWithLifetimeContainer } from "@osucad/core";
import { Axes, dependencyLoader, resolved } from "@osucad/framework";
import { EditorClock } from "../../EditorClock";
import { EditorBeatmap } from "../../runtime";
import { ComposeTimeline } from "./ComposeTimeline";
import type { TimelineBlueprint } from "./TimelineBlueprint";
import { TimelinePart } from "./TimelinePart";

export abstract class TimelineBlueprintContainer extends PooledDrawableWithLifetimeContainer<HitObjectLifetimeEntry, TimelineBlueprint>
{
  readonly #entryMap = new Map<HitObject, HitObjectLifetimeEntry>();

  @resolved(EditorBeatmap)
  accessor #beatmap!: EditorBeatmap

  @resolved(EditorClock)
  accessor #editorClock!: EditorClock

  @resolved(() => ComposeTimeline)
  accessor #timeline!: ComposeTimeline

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
  }

  #addHitObject(hitObject: HitObject)
  {
    const entry = new TimelineLifetimeEntry(hitObject);

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

    super.dispose();
  }
}

class TimelineLifetimeEntry extends HitObjectLifetimeEntry
{
  public constructor(hitObject: HitObject)
  {
    super(hitObject);

    hitObject.defaultsApplied.addListener(this.setInitialLifetime, this);
  }

  protected override setInitialLifetime(): void
  {
    super.setInitialLifetime();
    this.lifetimeEnd = this.hitObject.endTime;
  }

  public override get initialLifetimeOffset(): number
  {
    return 0;
  }
}
