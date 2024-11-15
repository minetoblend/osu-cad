import type { AudioChannel, Drawable, IDisposable, IResourceStore, Sample } from 'osucad-framework';
import type { Texture } from 'pixi.js';
import type { HitSample } from '../hitsounds/HitSample';
import type { IResourcesProvider } from '../io/IResourcesProvider';
import type { ISkin } from './ISkin';
import type { ISkinComponentLookup } from './ISkinComponentLookup';
import type { SkinInfo } from './SkinInfo';
import { Bindable, DrawableSprite, ResourceStore } from 'osucad-framework';
import { SkinConfig } from './SkinConfig';
import { SkinConfiguration } from './SkinConfiguration';
import { SkinnableTextureAnimation } from './SkinnableTextureAnimation';
import { SkinSampleStore } from './SkinSampleStore';
import { SpriteComponentLookup } from './SpriteComponentLookup';
import { StableSkinConfigurationDecoder } from './StableSkinConfigurationDecoder';
import { TextureStore } from './TextureStore';

export abstract class Skin implements IDisposable, ISkin {
  protected readonly textures: TextureStore | null = null;

  protected readonly samples: SkinSampleStore | null = null;

  readonly name: string;

  #store = new ResourceStore<ArrayBuffer>();

  protected get store() {
    return this.#store;
  }

  async load() {
    const configuration = await this.#store.getAsync(this.configurationFilename);
    if (configuration) {
      this.parseConfiguration(configuration);
    }
    else {
      this.configuration = new SkinConfiguration();
    }
  }

  protected constructor(info: SkinInfo, resources: IResourcesProvider, fallbackStore?: IResourceStore<ArrayBuffer>, readonly configurationFilename = 'skin.ini') {
    this.name = info.name;

    if (fallbackStore) {
      this.#store.addStore(fallbackStore);

      this.textures = new TextureStore(fallbackStore);
      this.samples = new SkinSampleStore(resources.audioManager, fallbackStore);
    }
  }

  abstract getTexture(componentName: string): Texture | null;

  getDrawableComponent(lookup: ISkinComponentLookup): Drawable | null {
    if (lookup instanceof SpriteComponentLookup) {
      return this.getSprite(lookup.lookupName);
    }

    return null;
  }

  getSprite(name: string) {
    const texture = this.getTexture(name);
    if (!texture)
      return null;

    return new DrawableSprite({ texture });
  }

  getAnimation(componentName: string, options: AnimationOptions) {
    const {
      animatable,
      looping,
      applyConfigFrameRate = false,
      animationSeparator = '-',
      startAtCurrentTime = true,
      frameLength,
      maxSize,
    } = options;

    const getFrameName = (frameIndex: number) => `${componentName}${animationSeparator}${frameIndex}`;

    const textures = [];

    if (animatable) {
      for (let i = 0; true; i++) {
        const texture = this.getTexture(getFrameName(i));

        if (componentName === 'hit100')
          console.log(texture, i, getFrameName(i));

        if (!texture)
          break;

        textures.push(texture);
      }
    }

    if (textures.length === 0) {
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

  #getFrameLength(applyConfigFrameRate: boolean, textures: Texture[]) {
    if (applyConfigFrameRate) {
      const iniRate = this.getConfig(SkinConfig.AnimationFramerate);

      if (iniRate && iniRate?.value > 0)
        return 1000 / iniRate.value;

      return 1000 / textures.length;
    }

    return 1000 / 60;
  }

  configuration!: SkinConfiguration;

  protected parseConfiguration(config: ArrayBuffer) {
    this.configuration = new StableSkinConfigurationDecoder().decode(config);
  }

  getSample(channel: AudioChannel, sample: string | HitSample): Sample | null {
    if (typeof sample !== 'string') {
      const key = sample.sampleName;
      if (key)
        return this.samples?.getSample(channel, key) ?? null;

      return null;
    }

    return this.samples?.getSample(channel, sample) ?? null;
  }

  #isDisposed = false;

  dispose(disposing = true) {
    if (this.#isDisposed)
      return;

    this.#isDisposed = true;

    this.textures?.dispose();

    this.#store.dispose();
  }

  toString() {
    return `${this.constructor.name} { name: ${this.name} }`;
  }

  getConfig<T>(key: SkinConfig<T>): Bindable<T> | null;

  getConfig<T>(key: SkinConfig<T>): any {
    switch (key) {
      case SkinConfig.ComboColors:
        return new Bindable(this.configuration.comboColors);

      case SkinConfig.SliderTrackOverride:
        if (this.configuration.customColors.has('SliderTrackOverride'))
          return new Bindable(this.configuration.customColors.get('SliderTrackOverride')!);
        break;

      case SkinConfig.SliderBorder:
        if (this.configuration.customColors.has('SliderBorder'))
          return new Bindable(this.configuration.customColors.get('SliderBorder')!);
        break;

      case SkinConfig.AllowSliderBallTint:
        if (this.configuration.configMap.has('AllowSliderBallTint'))
          return new Bindable(this.configuration.configMap.get('AllowSliderBallTint') === '1');
        break;

      case SkinConfig.AnimationFramerate:
      {
        const value = this.configuration.configMap.get('AnimationFramerate');
        if (!value)
          break;
        const parsed = Number.parseFloat(value);
        if (Number.isNaN(parsed))
          break;
        return new Bindable(parsed);
      }

      case SkinConfig.HitCircleOverlap:
      {
        const value = this.configuration.configMap.get('HitCircleOverlap');
        if (value === undefined)
          break;

        const parsed = Number.parseFloat(value);
        if (Number.isNaN(parsed))
          return new Bindable(-2);

        return new Bindable(parsed);
      }
    }
    return null;
  }
}

interface AnimationOptions {
  animatable: boolean;
  looping: boolean;
  applyConfigFrameRate?: boolean;
  animationSeparator?: string;
  startAtCurrentTime?: boolean;
  frameLength?: number;
  maxSize?: number;
}
