import type { MouseDownEvent } from "@osucad/framework";
import { Anchor, Axes, Bindable, Box, CircularContainer, dependencyLoader, EasingFunction, PoolableDrawable, Vec2 } from "@osucad/framework";
import type { HitCircle } from "../../../hitObjects/HitCircle";
import { OsuHitObject } from "../../../hitObjects/OsuHitObject";
import type { DrawableHitObject } from "@osucad/core";

export class HitCircleSelectionBlueprint extends PoolableDrawable
{
  constructor(readonly hitObject: HitCircle)
  {
    super();

    this.alwaysPresent = true;
    this.alpha = 0;
  }

  readonly scaleBindable = new Bindable(1);
  readonly positionBindable = new Bindable(new Vec2());
  readonly stackHeightBindable = new Bindable(0);

  selected = false;

  drawableHitObject: DrawableHitObject | null = null;

  override get shouldBeAlive(): boolean
  {
    return this.selected || !!this.drawableHitObject;
  }

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

  override receivePositionalInputAt(screenSpacePosition: Vec2): boolean
  {
    return this.toLocalSpace(screenSpacePosition).distanceSq(this.drawSize.scale(0.5)) < this.hitObject.radius * this.hitObject.radius;
  }

  override onMouseDown(e: MouseDownEvent): boolean
  {
    this.selected = !this.selected;
    return true;
  }
}
