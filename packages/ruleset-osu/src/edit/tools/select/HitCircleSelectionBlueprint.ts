import { Anchor, Axes, Bindable, Box, CircularContainer, dependencyLoader, Vec2 } from "@osucad/framework";
import type { HitCircle } from "../../../hitObjects";
import { OsuHitObject } from "../../../hitObjects";
import { HitObjectSelectionBlueprint } from "./HitObjectSelectionBlueprint";
import { SkinnableDrawable } from "@osucad/core";
import { OsuSkinComponents } from "../../../skinning";

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
      new SkinnableDrawable(OsuSkinComponents.HitCircleSelect).with({
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
    ];
  }

  protected override loadComplete(): void
  {
    super.loadComplete();

    this.scaleBindable.bindValueChanged(e => this.scale = e.value, true);
    this.positionBindable.bindValueChanged(e => this.position = this.hitObject.stackedPosition, true);
    this.stackHeightBindable.bindValueChanged(e => this.position = this.hitObject.stackedPosition);
  }
}
