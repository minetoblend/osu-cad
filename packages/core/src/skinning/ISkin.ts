import type { Bindable, Drawable } from "@osucad/framework";
import { injectionToken } from "@osucad/framework";
import type { Color, Texture } from "pixi.js";
import type { SkinConfigurationLookup, SkinConfigurationValue } from "./SkinConfiguration";

export type SkinComponentLookup = string;

export interface ISkin
{
  getTexture(componentName: string): Texture | null

  getDrawableComponent(lookup: SkinComponentLookup): Drawable | null

  getConfigValue<T extends SkinConfigurationLookup>(lookup: T): SkinConfigurationValue<T> | null;

  getConfigBindable<T extends SkinConfigurationLookup>(lookup: T): Bindable<SkinConfigurationValue<T> | null>;

  getComboColor(comboIndex: number): Color;
}

export const ISkin = injectionToken<ISkin>();
