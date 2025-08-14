import { Anchor, Axes, Bindable, Box, CircularContainer, dependencyLoader, Vec2 } from "@osucad/framework";
import type { HitCircle } from "../../../hitObjects/HitCircle";
import { OsuHitObject } from "../../../hitObjects/OsuHitObject";
import { HitObjectSelectionBlueprint } from "./HitObjectSelectionBlueprint";

export class HitCircleSelectionBlueprint extends HitObjectSelectionBlueprint<HitCircle>
{
  readonly scaleBindable = new Bindable(1);
  readonly positionBindable = new Bindable(new Vec2());
  readonly stackHeightBindable = new Bindable(0);

  override update(): void
  {
    super.update();
    this.alpha = this.selected ? 1 : 0;
  }

  @dependencyLoader()
  #load()
  {
    this.origin = Anchor.Center;
    this.size = OsuHitObject.OBJECT_DIMENSIONS;
    this.cornerRadius = OsuHitObject.OBJECT_RADIUS;

    this.scaleBindable.bindTo(this.hitObject.scaleBindable);
    this.positionBindable.bindTo(this.hitObject.positionBindable);
    this.stackHeightBindable.bindTo(this.hitObject.stackHeightBindable);

    this.internalChildren = [
      new CircularContainer({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        masking: true,
        child: new Box({
          relativeSizeAxes: Axes.Both,
          alpha: 0.2,
        }),
      }),
      // new SkinnableDrawable(OsuSkinComponents.HitCircleSelect).with({
      //   relativeSizeAxes: Axes.Both,
      // }),
    ];
  }

  protected override loadComplete(): void
  {
    super.loadComplete();

    this.scaleBindable.bindValueChanged(e => this.scale = e.value, true);
    this.positionBindable.bindValueChanged(e => this.position = this.hitObject.stackedPosition, true);
    this.stackHeightBindable.bindValueChanged(e => this.position = this.hitObject.stackedPosition);
  }

  get #effectiveCornerRadius()
  {
    const cornerRadius = this.cornerRadius;

    if (cornerRadius === 0)
      return 0;

    const { drawWidth, drawHeight } = this;

    return Math.min(cornerRadius , drawWidth / 2, drawHeight / 2);
  }
}
