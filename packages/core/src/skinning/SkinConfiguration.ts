import { effectScope, reactive } from "@osucad/framework";
import type { Color } from "pixi.js";

export interface SkinConfigurationFields
{
  version: string;
  animationFramerate: number;

  cursorCentre: boolean;
  cursorExpand: boolean;
  cursorRotate: boolean;
  cursorTrailRotate: boolean;

  allowSliderBallTint: boolean;
  hitCircleOverlayAboveNumber: boolean;
  layeredHitSounds: boolean;
  sliderBallFlip: boolean;
  spinnerFadePlayfield: boolean;
  spinnerFrequencyModulate: boolean;
  spinnerNoBlink: boolean;

  sliderBall: Color;
  sliderBorder: Color;
  sliderTrackOverride: Color;
  spinnerBackground: Color;
  starBreakAdditive: boolean;

  hitCirclePrefix: string;
  hitCircleOverlap: number;
  scorePrefix: string;
  scoreOverlap: number;
  comboPrefix: string;
  comboOverlap: number;
}

export type SkinConfigurationLookup = keyof SkinConfigurationFields;
export type SkinConfigurationValue<K extends SkinConfigurationLookup> = SkinConfigurationFields[K];

export class SkinConfiguration
{
  #scope = effectScope(true);

  constructor()
  {
    this.#scope.run(() =>
    {
      this.configValues = reactive({}) as Partial<SkinConfigurationFields>;
    });
  }

  comboColors: Color[] = [];

  private configValues!: Partial<SkinConfigurationFields>;

  public get<K extends SkinConfigurationLookup>(lookup: K): SkinConfigurationValue<K> | null
  {
    return this.configValues[lookup] ?? null;
  }

  public set<K extends SkinConfigurationLookup>(lookup: K, value: SkinConfigurationValue<K> | null)
  {
    this.configValues[lookup] = value ?? undefined;
  }

  dispose()
  {
    this.#scope.stop();
  }
}
