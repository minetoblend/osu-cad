import type { Bindable, DrawableOptions } from "@osucad/framework";
import { Anchor, Axes, CompositeDrawable, Vec2 } from "@osucad/framework";
import { SkinnableDrawable } from "@osucad/core";
import { OsuSkinComponents } from "../../skinning";
import { TimelineBlueprint } from "@osucad/editor";
import { OsuHitObject } from "../../hitObjects";
import type { SliderTimelineBlueprint } from "./SliderTimelineBlueprint";

export class TimelineSliderRepeat extends CompositeDrawable
{
  readonly #selectionOverlay: SkinnableDrawable;

  private readonly selected: Bindable<boolean>;

  public constructor(public readonly blueprint: SliderTimelineBlueprint, options: DrawableOptions = {})
  {
    super();

    this.selected = blueprint.selected.getBoundCopy();

    this.relativeSizeAxes = Axes.Both;
    this.relativePositionAxes = Axes.X;
    this.anchor = Anchor.CenterLeft;
    this.origin = Anchor.Center;
    this.scale = new Vec2(TimelineBlueprint.SIZE).divInPlace(OsuHitObject.OBJECT_DIMENSIONS);

    this.with(options);

    this.internalChildren = [
      new SkinnableDrawable(OsuSkinComponents.TimelineSliderRepeat).with({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
      this.#selectionOverlay = new SkinnableDrawable(OsuSkinComponents.HitCircleSelect).with({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
    ];
  }

  protected override loadComplete(): void
  {
    super.loadComplete();

    this.selected.bindValueChanged(e =>
      this.#selectionOverlay.alpha = e.value ? 1 : 0
    , true);
  }
}
