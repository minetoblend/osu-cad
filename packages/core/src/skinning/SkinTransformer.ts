import type { Drawable, Sample } from "@osucad/framework";
import type { Color, Texture } from "pixi.js";
import type { ISampleInfo } from "../audio/ISampleInfo";
import type { ISkin, SkinComponentLookup } from "./ISkin";
import type { Skin } from "./Skin";
import type { SkinConfigurationLookup, SkinConfigurationValue } from "./SkinConfiguration";

export type LoadTextureEntry =
    | string
    | { type: "texture", name: string }
    | ({ type: "animation", name: string } & AnimationOptions);

export interface AnimationOptions
{
  animatable?: boolean
  animationSeparator?: string
  looping?: boolean
  applyConfigFrameRate?: boolean
  startAtCurrentTime?: boolean,
  frameLength?: number,
  maxSize?: number
}

export abstract class SkinTransformer implements ISkin
{
  protected constructor(protected readonly source: Skin)
  {
  }

  get texturesChanged()
  {
    return this.source.texturesChanged;
  }

  getTexture(componentName: string): Texture | null
  {
    return this.source.getTexture(componentName);
  }

  public getSample(sampleInfo: ISampleInfo): Sample | null
  {
    return this.source.getSample(sampleInfo);
  }

  getConfig<T extends SkinConfigurationLookup>(lookup: T): SkinConfigurationValue<T> | null
  {
    return this.source.getConfig(lookup);
  }

  public getDrawableComponent(lookup: SkinComponentLookup): Drawable | null
  {
    return this.source.getDrawableComponent(lookup);
  }

  public getComboColor(comboIndex: number): Color
  {
    return this.source.getComboColor(comboIndex);
  }

  public destroy()
  {
  }
}
