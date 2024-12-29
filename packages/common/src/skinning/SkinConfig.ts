import type { Color } from 'pixi.js';
import { SkinConfigurationLookup } from './SkinConfigurationLookup';

export class SkinConfig<T> extends SkinConfigurationLookup<T> {
  constructor(readonly name: string) {
    super();
  }

  static ComboColors = new SkinConfig<readonly Color[]>('ComboColors');

  static SliderTrackOverride = new SkinConfig<Color | null>('SliderTrackOverride');

  static SliderBorder = new SkinConfig<Color | null>('SliderBorder');

  static AllowSliderBallTint = new SkinConfig<boolean>('AllowSliderBallTint');

  static HitCircleOverlap = new SkinConfig<number>('HitCircleOverlap');

  static AnimationFramerate = new SkinConfig<number>('AnimationFramerate');
}
