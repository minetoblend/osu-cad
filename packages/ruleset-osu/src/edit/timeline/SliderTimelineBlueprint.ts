import { SkinnableDrawable } from "@osucad/core";
import { TimelineBlueprint } from "@osucad/editor";
import type { Drawable } from "@osucad/framework";
import { Anchor, Axes, Box, Container, dependencyLoader, Vec2 } from "@osucad/framework";
import type { Slider } from "../../hitObjects";
import { OsuHitObject } from "../../hitObjects";
import { SliderRepeat } from "../../hitObjects/SliderRepeat";
import { OsuSkinComponents } from "../../skinning";
import { OsuTimelineBlueprint } from "./OsuTimelineBlueprint";
import { TimelineSliderTail } from "./TimelineSliderTail";

export class SliderTimelineBlueprint extends OsuTimelineBlueprint<Slider>
{
  #headCircle!: Container;
  #tailCircle!: TimelineSliderTail;
  #headSelectionOverlay!: SkinnableDrawable;
  #body!: Drawable;
  #repeats!: Container;

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
      this.#tailCircle = new TimelineSliderTail(this),
      this.#repeats = new Container({
        relativeSizeAxes: Axes.Both,
      }),
      this.#headCircle = new Container({
        relativeSizeAxes: Axes.Both,
        children: [
          new SkinnableDrawable(OsuSkinComponents.TimelineSliderHead).with({
            relativeSizeAxes: Axes.Both,
            anchor: Anchor.CenterLeft,
            origin: Anchor.Center,
            scale: new Vec2(TimelineBlueprint.SIZE).divInPlace(OsuHitObject.OBJECT_DIMENSIONS),
          }),
          this.#headSelectionOverlay = new SkinnableDrawable(OsuSkinComponents.HitCircleSelect).with({
            relativeSizeAxes: Axes.Both,
            anchor: Anchor.CenterLeft,
            origin: Anchor.Center,
            scale: new Vec2(TimelineBlueprint.SIZE).divInPlace(OsuHitObject.OBJECT_DIMENSIONS),
          }),
        ],
      }),
    ];
  }

  protected override loadComplete(): void
  {
    super.loadComplete();

    this.accentColor.bindValueChanged(color => this.#body.color = color.value, true);
    this.selected.bindValueChanged(selected =>
    {
      this.#headSelectionOverlay.alpha = selected.value ? 1 : 0;
      this.#tailCircle.selected = selected.value;
    }, true);
  }

  public override contains(screenSpacePosition: Vec2): boolean
  {
    return super.contains(screenSpacePosition)
        || this.#headSelectionOverlay.contains(screenSpacePosition)
        || this.#tailCircle.contains(screenSpacePosition);
  }

  protected override defaultsApplied(): void
  {
    this.size = new Vec2(this.hitObject.duration, TimelineBlueprint.SIZE);
    this.origin = Anchor.CenterLeft;

    this.#updateRepeats();
  }

  #updateRepeats()
  {
    let drawableIndex = 0;

    for (const h of this.hitObject.nestedHitObjects)
    {
      if (!(h instanceof SliderRepeat))
        continue;

      let repeat = this.#repeats.children[drawableIndex++];

      if (!repeat)
      {
        this.#repeats.add(
            repeat = new SkinnableDrawable(OsuSkinComponents.TimelineSliderRepeat).with({
              relativeSizeAxes: Axes.Both,
              relativePositionAxes: Axes.X,
              anchor: Anchor.CenterLeft,
              origin: Anchor.Center,
              scale: new Vec2(TimelineBlueprint.SIZE).divInPlace(OsuHitObject.OBJECT_DIMENSIONS),
              depth: drawableIndex,
            }),
        );
      }

      repeat.x = this.hitObject.duration === 0
        ? 0
        : (h.startTime - this.hitObject.startTime) / this.hitObject.duration;
    }

    while (drawableIndex < this.#repeats.children.length)
      this.#repeats.children[drawableIndex++]?.expire();
  }

}
