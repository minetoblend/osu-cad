import type { IResourcesProvider, ISampleInfo, ISkin, ISkinSource, SkinComponentLookup, SkinConfigurationLookup, SkinConfigurationValue } from "@osucad/core";
import { Skin } from "@osucad/core";
import type { Drawable, Sample } from "@osucad/framework";
import { Action, asyncDependencyLoader, AudioManager, Component, resolved, ZipArchiveFileSystem } from "@osucad/framework";
import type { Texture } from "pixi.js";
import { Color } from "pixi.js";
import oskFile from "./skin.zip?url";

export class SkinManager extends Component implements ISkinSource, IResourcesProvider
{
  @resolved(AudioManager)
  accessor audioManager!: AudioManager

  @asyncDependencyLoader()
  async #load()
  {
    const files = await fetch(oskFile)
      .then(res => res.arrayBuffer())
      .then(data => ZipArchiveFileSystem.createMutable(data));

    this.skin = new Skin(files, this);
    this.skin.config.comboColors = [
      new Color("rgb(255,198,138)"),
      new Color("rgb(196,196,196)"),
      new Color("rgb(193,157,192)"),
    ];
    // this.skin.config.set("hitCircleOverlap", 38);
  }

  skin!: Skin;
  sources!: Skin[];

  readonly sourceChanged = new Action();
  readonly texturesChanged = new Action();

  findProvider(predicate: (skin: ISkin) => boolean): ISkin | null
  {
    return this.sources.find(predicate) ?? null;
  }


  getTexture(componentName: string): Texture | null
  {
    return this.skin.getTexture(componentName);
  }

  getSample(sampleInfo: ISampleInfo): Sample | null
  {
    return this.skin.getSample(sampleInfo);
  }

  getDrawableComponent(lookup: SkinComponentLookup): Drawable | null
  {
    return this.skin.getDrawableComponent(lookup);
  }

  getConfig<T extends SkinConfigurationLookup>(lookup: T): SkinConfigurationValue<T> | null
  {
    return this.skin.getConfig(lookup);
  }

  getComboColor(comboIndex: number): Color
  {
    return this.skin.getComboColor(comboIndex);
  }
}
