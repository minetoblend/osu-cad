import type { DragStartEvent, DragEvent, DragEndEvent, MouseDownEvent } from "@osucad/framework";
import { clamp } from "@osucad/framework";
import { Anchor, Axes, CompositeDrawable, resolved, Vec2 } from "@osucad/framework";
import { OsuSkinComponents } from "../../skinning";
import { OsuHitObject } from "../../hitObjects";
import { SkinnableDrawable } from "@osucad/core";
import { BindableBeatDivisor, ComposeTimeline, EditorBeatmap, EditorHistory, TimelineBlueprint } from "@osucad/editor";
import type { SliderTimelineBlueprint } from "./SliderTimelineBlueprint";

export class TimelineSliderTail extends CompositeDrawable
{
  readonly #selectionOverlay: SkinnableDrawable;

  @resolved(EditorHistory)
  accessor #history!: EditorHistory

  public constructor(private readonly blueprint: SliderTimelineBlueprint)
  {
    super();

    this.size = new Vec2(TimelineBlueprint.SIZE);
    this.anchor = Anchor.CenterRight;
    this.origin = Anchor.Center;

    this.internalChildren = [
      new SkinnableDrawable(OsuSkinComponents.TimelineSliderTail).with({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        scale: new Vec2(TimelineBlueprint.SIZE).divInPlace(OsuHitObject.OBJECT_DIMENSIONS),
      }),
      this.#selectionOverlay = new SkinnableDrawable(OsuSkinComponents.HitCircleSelect).with({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        scale: new Vec2(TimelineBlueprint.SIZE).divInPlace(OsuHitObject.OBJECT_DIMENSIONS),
      }),
    ];
  }

  public set selected(value: boolean)
  {
    this.#selectionOverlay.alpha = value ? 1 : 0;
  }


  protected override onDragStart(e: DragStartEvent)
  {
    return true;
  }

  @resolved(ComposeTimeline)
  accessor #timeline!: ComposeTimeline

  @resolved(EditorBeatmap)
  accessor #beatmap!: EditorBeatmap

  @resolved(BindableBeatDivisor)
  private accessor beatDivisor!: BindableBeatDivisor

  protected override onDrag(e: DragEvent)
  {
    this.#history.discardUncommittedChanges();

    const time = this.#timeline.timeAtScreenSpacePosition(e.screenSpaceMousePosition);

    if (e.shiftPressed)
    {
      const snapped = this.#beatmap.controlPointInfo.snap(time, this.beatDivisor.value);

      const slider = this.blueprint.hitObject;

      const duration = snapped - slider.startTime;

      const velocity = slider.path.distance * slider.spanCount() / slider.baseVelocity / duration;
      if (Number.isFinite(velocity))
        slider.velocityOverride = clamp(velocity, 0.1, 10);

      return true;
    }

    const slider = this.blueprint.hitObject;

    if (slider.spanDuration() === 0)
      return true;

    const numSpans = Math.round((time - slider.startTime) / slider.spanDuration());

    slider.repeatCount = Math.max(0, numSpans - 1);

    return true;
  }

  protected override onDragEnd(e: DragEndEvent)
  {
    this.#history.commit();
  }
}
