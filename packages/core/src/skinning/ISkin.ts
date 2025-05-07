import type { Action, Drawable, Sample } from "@osucad/framework";
import { injectionToken } from "@osucad/framework";
import type { Color, Texture } from "pixi.js";
import type { ISampleInfo } from "../audio/ISampleInfo";
import type { SkinConfigurationLookup, SkinConfigurationValue } from "./SkinConfiguration";
import type { SkinComponentLookup } from "./SkinComponentLookup";

export interface ISkin
{
  readonly texturesChanged: Action;

  getTexture(componentName: string): Texture | null

  getSample(sampleInfo: ISampleInfo): Sample | null

  getDrawableComponent(lookup: SkinComponentLookup): Drawable | null

  getConfig<T extends SkinConfigurationLookup>(lookup: T): SkinConfigurationValue<T> | null;

  getComboColor(comboIndex: number): Color;
}

export const ISkin = injectionToken<ISkin>();
