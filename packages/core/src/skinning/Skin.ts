import { Action, type Drawable, type IFileSystem, type Sample } from "@osucad/framework";
import type { Texture } from "pixi.js";
import { Color } from "pixi.js";
import type { ISampleInfo } from "../audio/ISampleInfo";
import type { IResourcesProvider } from "../io/IResourcesProvider";
import type { ISkin } from "./ISkin";
import type { SkinConfigurationLookup, SkinConfigurationValue } from "./SkinConfiguration";
import { SkinConfiguration } from "./SkinConfiguration";
import { SkinSampleStore } from "./SkinSampleStore";
import type { SkinComponentLookup } from "./SkinComponentLookup";

export class Skin implements ISkin
{
  public readonly config = new SkinConfiguration();

  public readonly samples: SkinSampleStore;

  public readonly texturesChanged = new Action();

  public constructor(public readonly files: IFileSystem, resourcesProvider: IResourcesProvider)
  {
    this.samples = new SkinSampleStore(
        files,
        resourcesProvider.audioManager,
    );
  }

  public getTexture(lookup: string): Texture | null
  {
    return null;
  }

  public getSample(sampleInfo: ISampleInfo): Sample | null
  {
    for (const lookup of sampleInfo.lookupNames)
    {
      const sample = this.samples.get(lookup);
      if (sample)
        return sample;
    }

    return null;
  }

  public getDrawableComponent(lookup: SkinComponentLookup): Drawable | null
  {
    return null;
  }

  public getConfig<T extends SkinConfigurationLookup>(lookup: T): SkinConfigurationValue<T> | null
  {
    return this.config.get(lookup);
  }

  public get comboColors()
  {
    if (this.config.comboColors.length)
      return this.config.comboColors;

    return [new Color("white")];
  }

  public getComboColor(comboIndex: number)
  {
    const colors = this.comboColors;
    return colors[Math.max(comboIndex + 1, 0) % colors.length];
  }

  public dispose()
  {
    this.config.dispose();
  }
}
