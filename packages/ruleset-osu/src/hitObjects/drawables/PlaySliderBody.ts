import { ISkinSource } from "@osucad/core";
import type { ReadonlyDependencyContainer } from "@osucad/framework";
import { Bindable, resolved } from "@osucad/framework";
import { Color } from "pixi.js";
import { OsuHitObject } from "../OsuHitObject";
import { SnakingSliderBody } from "./SnakingSliderBody";

export class PlaySliderBody extends SnakingSliderBody
{
  scaleBindable!: Bindable<number>;
  accentColorBindable!: Bindable<Color>;
  pathVersion = new Bindable(0);

  @resolved(ISkinSource)
  protected skin!: ISkinSource;

  borderColorBindable!: Bindable<Color | null>;
  sliderTrackOverrideBindable!: Bindable<Color | null>;

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.snakingIn.bindTo(this.drawableSlider.snakingIn);
    this.snakingOut.bindTo(this.drawableSlider.snakingOut);

    this.pathVersion.bindTo(this.drawableSlider.pathVersion);
    this.pathVersion.bindValueChanged(() => this.scheduler.addOnce(this.refresh, this));

    this.sliderTrackOverrideBindable = this.skin.getConfigBindable("sliderTrackOverride");
    this.sliderTrackOverrideBindable.bindValueChanged(this.updateAccentColor, this);

    this.accentColorBindable = this.drawableSlider.accentColor.getBoundCopy();
    this.accentColorBindable.bindValueChanged(this.updateAccentColor, this, true);

    this.scaleBindable = this.drawableSlider.scaleBindable.getBoundCopy();
    this.scaleBindable.bindValueChanged(scale => this.pathRadius = OsuHitObject.OBJECT_RADIUS * scale.value, true);

    this.borderColorBindable = this.skin.getConfigBindable("sliderBorder");
    this.borderColorBindable.bindValueChanged(() => this.borderColor = this.getSliderBorder(), true);
  }

  protected updateAccentColor()
  {
    this.accentColor = this.getBodyAccentColor(this.accentColorBindable.value);
  }

  protected getBodyAccentColor(color: Color)
  {
    return this.skin.getConfigValue("sliderTrackOverride") ?? color;
  }

  protected getSliderBorder()
  {
    return this.borderColorBindable.value ?? new Color(0xffffff);
  }
}
