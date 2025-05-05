import { ISkinSource } from "@osucad/core";
import type { ReadonlyDependencyContainer } from "@osucad/framework";
import { Bindable, resolved } from "@osucad/framework";
import { Color } from "pixi.js";
import { OsuHitObject } from "../OsuHitObject";
import { SnakingSliderBody } from "./SnakingSliderBody";
import { computed, watch, withEffectScope } from "@osucad/framework";

const WHITE = new Color(0xffffff);

export class PlaySliderBody extends SnakingSliderBody
{
  scaleBindable!: Bindable<number>;
  accentColorBindable!: Bindable<Color>;
  pathVersion = new Bindable(0);

  @resolved(ISkinSource)
  protected skin!: ISkinSource;

  protected readonly sliderBorder = computed(() => this.skin.getConfig("sliderBorder"));
  protected readonly sliderTrackOverride = computed(() => this.skin.getConfig("sliderTrackOverride"));

  @withEffectScope()
  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.snakingIn.bindTo(this.drawableSlider.snakingIn);
    this.snakingOut.bindTo(this.drawableSlider.snakingOut);

    this.pathVersion.bindTo(this.drawableSlider.pathVersion);
    this.pathVersion.bindValueChanged(() => this.scheduler.addOnce(this.refresh, this));

    this.accentColorBindable = this.drawableSlider.accentColor.getBoundCopy();
    this.accentColorBindable.bindValueChanged(this.updateAccentColor, this, true);

    this.scaleBindable = this.drawableSlider.scaleBindable.getBoundCopy();
    this.scaleBindable.bindValueChanged(scale => this.pathRadius = OsuHitObject.OBJECT_RADIUS * scale.value, true);

    watch(this.sliderTrackOverride, () => this.updateAccentColor());
    watch(this.sliderBorder, () => this.borderColor = this.getSliderBorder());
  }

  protected updateAccentColor()
  {
    this.accentColor = this.getBodyAccentColor(this.accentColorBindable.value);
  }

  protected getBodyAccentColor(color: Color)
  {
    return this.sliderTrackOverride.value ?? color;
  }

  protected getSliderBorder()
  {
    return this.sliderBorder.value ?? WHITE;
  }
}
