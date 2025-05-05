import type { Drawable, Sample } from "@osucad/framework";
import { DrawableSprite } from "@osucad/framework";
import type { Color, Texture } from "pixi.js";
import type { ISampleInfo } from "../audio/ISampleInfo";
import type { ISkin, SkinComponentLookup } from "./ISkin";
import type { Skin } from "./Skin";
import type { SkinConfigurationLookup, SkinConfigurationValue } from "./SkinConfiguration";
import { SkinnableTextureAnimation } from "./SkinnableTextureAnimation";

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

  protected async loadTextures(textures: LoadTextureEntry[])
  {
    await Promise.all(textures.map(options =>
    {
      if (typeof options === "string")
        return this.textures.load(options);

      if (options.type === "texture")
        return this.textures.load(options.name);

      if (options.type === "animation")
        return this.loadAnimation(options.name, options);

      return undefined;
    }));
  }

  async loadAnimation(componentName: string, options: AnimationOptions = {}): Promise<void>
  {
    const {
      animationSeparator = "-",
    } = options;

    const getFrameName = (frameIndex: number) => `${componentName}${animationSeparator}${frameIndex}`;

    let frameCount = 0;
    while (true)
    {
      if (!this.textures.canLoad(getFrameName(frameCount)))
      {
        break;
      }

      frameCount++;
    }

    if (frameCount > 0)
    {
      const textures: Promise<any>[] = [];
      for (let i = 0; i < frameCount; i++)
        textures.push(this.textures.load(getFrameName(i)));

      await Promise.all(textures);
    }
    else
    {
      await this.textures.load(componentName);
    }
  }

  getAnimation(componentName: string, options: AnimationOptions = {})
  {
    const {
      animatable,
      looping = false,
      animationSeparator = "-",
      applyConfigFrameRate = false,
      startAtCurrentTime = true,
      frameLength,
    } = options;

    const getFrameName = (frameIndex: number) => `${componentName}${animationSeparator}${frameIndex}`;

    const textures: Texture[] = [];
    if (animatable)
    {
      let frameCount = 0;
      while (true)
      {
        const texture = this.getTexture(getFrameName(frameCount));

        if (!texture)
          break;

        textures.push(texture);

        frameCount++;
      }
    }

    if (textures.length === 0)
    {
      const texture = this.getTexture(componentName);

      if (texture)
        return new DrawableSprite({ texture });

      return null;
    }

    const animation = new SkinnableTextureAnimation(startAtCurrentTime);
    animation.loop = looping;
    animation.defaultFrameLength = frameLength ?? this.#getFrameLength(applyConfigFrameRate, textures);

    for (const t of textures)
      animation.addFrame(t);

    return animation;
  }

  #getFrameLength(applyConfigFrameRate: boolean, textures: Texture[])
  {
    if (applyConfigFrameRate)
    {
      const iniRate = this.getConfig("animationFramerate");

      if (iniRate && iniRate > 0)
        return 1000 / iniRate;

      return 1000 / textures.length;
    }

    return 1000 / 60;
  }


  get textures()
  {
    return this.source.textures;
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
