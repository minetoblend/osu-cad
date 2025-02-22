import type { ReadonlyDependencyContainer } from '@osucad/framework';
import type { DrawableSlider } from '@osucad/ruleset-osu';
import type { Color } from 'pixi.js';
import { DrawableHitObject, HitObjectSelectionManager, ISkinSource, OsucadConfigManager, OsucadSettings, SkinConfig } from '@osucad/core';
import { Bindable } from '@osucad/framework';
import { OsuHitObject } from '@osucad/ruleset-osu';
import { SnakingSliderBody } from './SnakingSliderBody';

export enum SelectionType {
  None,
  HitObject,
  Body,
}

export class PlaySliderBody extends SnakingSliderBody {
  scaleBindable!: Bindable<number >;
  accentColorBindable!: Bindable<Color>;
  pathVersion = new Bindable(0);

  readonly selected = new Bindable<SelectionType>(SelectionType.None);

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const drawableObject = dependencies.resolve(DrawableHitObject) as DrawableSlider;
    const skin = dependencies.resolve(ISkinSource);

    this.pathVersion.bindTo(drawableObject.pathVersion);
    this.pathVersion.bindValueChanged(() => this.scheduler.addOnce(this.refresh, this));

    this.scaleBindable = drawableObject.scaleBindable.getBoundCopy();
    this.scaleBindable.bindValueChanged(scale => this.pathRadius = OsuHitObject.object_radius * scale.value, true);

    this.accentColorBindable = drawableObject.accentColor.getBoundCopy();
    this.accentColorBindable.bindValueChanged(accent => this.accentColor = this.getBodyAccentColor(skin, accent.value), true);

    const config = dependencies.resolve(OsucadConfigManager);

    config.bindWith(OsucadSettings.SnakingOutSliders, this.snakingOut);
    config.bindWith(OsucadSettings.SnakingInSliders, this.snakingIn);

    const selection = dependencies.resolveOptional(HitObjectSelectionManager);
  }

  protected getBodyAccentColor(skin: ISkinSource, hitObjectAccentColour: Color) {
    return skin.getConfig(SkinConfig.SliderTrackOverride) ?? hitObjectAccentColour;
  }

  protected override loadComplete() {
    super.loadComplete();

    this.selected.bindValueChanged(selected => this.selectionChanged(selected.value), true);
  }

  protected selectionChanged(selection: SelectionType) {}
}
