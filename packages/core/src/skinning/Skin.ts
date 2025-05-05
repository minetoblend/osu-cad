import { Bindable, Drawable, IFileSystem } from "@osucad/framework";
import { Color, Texture } from "pixi.js";
import { ISkin, SkinComponentLookup } from "./ISkin";
import { SkinConfiguration, SkinConfigurationLookup, SkinConfigurationValue } from "./SkinConfiguration";
import { SkinTextureStore } from "./SkinTextureStore";

export class Skin implements ISkin 
{
  readonly config = new SkinConfiguration();

  readonly textures: SkinTextureStore;

  constructor(readonly files: IFileSystem) 
  {
    this.textures = new SkinTextureStore(files);
  }

  getTexture(lookup: string): Texture | null 
  {
    return this.textures.get(lookup) ?? null;
  }

  public getDrawableComponent(lookup: SkinComponentLookup): Drawable | null 
  {
    return null;
  }

  getConfigValue<T extends SkinConfigurationLookup>(lookup: T): SkinConfigurationValue<T> | null 
  {
    return this.config.get(lookup);
  }

  getConfigBindable<T extends SkinConfigurationLookup>(lookup: T): Bindable<SkinConfigurationValue<T> | null> 
  {
    return this.config.getBindable(lookup);
  }

  get comboColors() 
  {
    if (this.config.comboColors.length)
      return this.config.comboColors;
    return  [new Color("white")];
  }

  getComboColor(comboIndex: number) 
  {
    const colors = this.comboColors;
    return colors[Math.max(comboIndex, 0) % colors.length];
  }

  dispose() 
  {
    this.config.dispose();
    this.textures.dispose();
  }
}
