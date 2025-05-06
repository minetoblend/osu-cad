import { Action, type Drawable, type IFileSystem, type Sample } from "@osucad/framework";
import type { Texture } from "pixi.js";
import { Color } from "pixi.js";
import type { ISampleInfo } from "../audio/ISampleInfo";
import type { IResourcesProvider } from "../io/IResourcesProvider";
import type { ISkin, SkinComponentLookup } from "./ISkin";
import type { SkinConfigurationLookup, SkinConfigurationValue } from "./SkinConfiguration";
import { SkinConfiguration } from "./SkinConfiguration";
import { SkinSampleStore } from "./SkinSampleStore";

export class Skin implements ISkin
{
  readonly config = new SkinConfiguration();

  readonly samples: SkinSampleStore;

  readonly texturesChanged = new Action();

  constructor(readonly files: IFileSystem, resourcesProvider: IResourcesProvider)
  {
    this.samples = new SkinSampleStore(
        files,
        resourcesProvider.audioManager,
        resourcesProvider.audioMixer.hitSounds,
    );
  }

  getTexture(lookup: string): Texture | null
  {
    return null;
  }

  getSample(sampleInfo: ISampleInfo): Sample | null
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

  getConfig<T extends SkinConfigurationLookup>(lookup: T): SkinConfigurationValue<T> | null
  {
    return this.config.get(lookup);
  }

  get comboColors()
  {
    if (this.config.comboColors.length)
    {
      if (this.config.comboColors.length > 1)
        return this.config.comboColors.slice(1).concat(this.config.comboColors[0]);

      return this.config.comboColors;
    }

    return [new Color("white")];
  }

  getComboColor(comboIndex: number)
  {
    const colors = this.comboColors;
    return colors[Math.max(comboIndex, 0) % colors.length];
  }

  dispose()
  {
    this.config.dispose();
  }
}
