import type { Bindable, ReadonlyDependencyContainer } from '@osucad/framework';
import type { DrawableSlider } from '@osucad/ruleset-osu';
import type { Color } from 'pixi.js';
import { DrawableHitObject, ISkinSource, OsucadConfigManager, OsucadSettings, SkinConfig } from '@osucad/core';
import { OsuHitObject } from '@osucad/ruleset-osu';
import { SnakingSliderBody } from './SnakingSliderBody';

export class PlaySliderBody extends SnakingSliderBody {
  scaleBindable!: Bindable<number >;
  accentColorBindable!: Bindable<Color>;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const drawableObject = dependencies.resolve(DrawableHitObject) as DrawableSlider;
    const skin = dependencies.resolve(ISkinSource);

    this.scaleBindable = drawableObject.scaleBindable.getBoundCopy();
    this.scaleBindable.bindValueChanged(scale => this.pathRadius = OsuHitObject.object_radius * scale.value, true);

    this.accentColorBindable = drawableObject.accentColor.getBoundCopy();
    this.accentColorBindable.bindValueChanged(accent => this.accentColor = this.getBodyAccentColor(skin, accent.value), true);

    const config = dependencies.resolve(OsucadConfigManager);

    config.bindWith(OsucadSettings.SnakingOutSliders, this.snakingOut);
    config.bindWith(OsucadSettings.SnakingInSliders, this.snakingIn);
  }

  protected getBodyAccentColor(skin: ISkinSource, hitObjectAccentColour: Color) {
    return skin.getConfig(SkinConfig.SliderTrackOverride) ?? hitObjectAccentColour;
  }
}
