import type { SkinInfo } from './SkinInfo';
import { Color } from 'pixi.js';

export class SkinConfiguration {
  readonly skinInfo: SkinInfo = {
    name: '',
    creator: '',
  };

  version: string | null = null;

  allowDefaultComboColorsFallback = true;

  static readonly defaultComboColors: Color[] = [
    new Color('rgba(255, 192, 0, 255)'),
    new Color('rgba(0, 202, 0, 255)'),
    new Color('rgba(18, 124, 255, 255)'),
    new Color('rgba(242, 24, 57, 255)'),
  ];

  customComboColors: Color[] = [];

  get comboColors(): Color[] {
    if (this.customComboColors.length > 0)
      return this.customComboColors;
    if (this.allowDefaultComboColorsFallback)
      return SkinConfiguration.defaultComboColors;

    return [];
  }

  readonly customColors = new Map<string, Color>();

  readonly configMap = new Map<string, string>();
}

export enum StableSkinSetting {
  Version,
  ComboPrefix,
  ComboOverlap,
  ScorePrefix,
  ScoreOverlap,
  HitCirclePrefix,
  HitCircleOverlap,
  AnimationFramerate,
  LayeredHitSounds,
  AllowSliderBallTint,
  InputOverlayText,
}
