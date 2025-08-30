import { SkinnableDrawable } from "@osucad/core";
import { TimelineBlueprint } from "@osucad/editor";
import type { Drawable } from "@osucad/framework";
import { Anchor, Axes, Box, dependencyLoader, Vec2 } from "@osucad/framework";
import type { Slider } from "../../hitObjects";
import { OsuHitObject } from "../../hitObjects";
import { OsuSkinComponents } from "../../skinning";
import { OsuTimelineBlueprint } from "./OsuTimelineBlueprint";

export class SliderTimelineBlueprint extends OsuTimelineBlueprint<Slider>
{
  #headCircle!: SkinnableDrawable;
  #tailCircle!: SkinnableDrawable;
  #body!: Drawable;

  @dependencyLoader()
  #load()
  {
    this.relativeSizeAxes = Axes.X;

    this.internalChildren = [
      this.#body = new Box({
        relativeSizeAxes: Axes.Both,
        alpha: 0.75,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        height: 0.9,
      }),
      this.#tailCircle = new SkinnableDrawable(OsuSkinComponents.TimelineSliderTail).with({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.CenterRight,
        origin: Anchor.Center,
        scale: new Vec2(TimelineBlueprint.SIZE).divInPlace(OsuHitObject.OBJECT_DIMENSIONS),
      }),
      this.#headCircle = new SkinnableDrawable(OsuSkinComponents.TimelineSliderHead).with({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.CenterLeft,
        origin: Anchor.Center,
        scale: new Vec2(TimelineBlueprint.SIZE).divInPlace(OsuHitObject.OBJECT_DIMENSIONS),
      }),
    ];
  }

  protected override loadComplete(): void
  {
    super.loadComplete();

    this.accentColor.bindValueChanged(color => this.#body.color = color.value, true);
  }

  protected override defaultsApplied(): void
  {
    this.size = new Vec2(this.hitObject.duration, TimelineBlueprint.SIZE);
    this.origin = Anchor.CenterLeft;
  }
}
