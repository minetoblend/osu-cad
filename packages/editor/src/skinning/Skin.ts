import type { AudioChannel, Drawable, IDisposable, Sample } from 'osucad-framework';
import type { Texture } from 'pixi.js';
import type { IResourcesProvider } from '../io/IResourcesProvider';
import type { IResourceStore } from './IResourceStore';
import type { ISkin } from './ISkin';
import type { ISkinComponentLookup } from './ISkinComponentLookup';
import type { SkinInfo } from './SkinInfo';
import { DrawableSprite } from 'osucad-framework';
import { SkinnableTextureAnimation } from './DrawableAnimation';
import { ResourceStore } from './ResourceStore';
import { SkinConfiguration } from './SkinConfiguration';
import { SpriteComponentLookup } from './SkinnableSprite';
import { SampleStore } from './stable/SampleStore.ts';
import { StableSkinConfigurationDecoder } from './StableSkinConfigurationDecoder';
import { TextureStore } from './TextureStore';

export abstract class Skin implements IDisposable, ISkin {
  protected readonly textures: TextureStore | null = null;

  protected readonly samples: SampleStore | null = null;

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

  #resources: IResourcesProvider | null = null;

  protected constructor(info: SkinInfo, resources: IResourcesProvider, fallbackStore?: IResourceStore<ArrayBuffer>, readonly configurationFilename = 'skin.ini') {
    this.#resources = resources;

    this.name = info.name;

    if (fallbackStore) {
      this.#store.addStore(fallbackStore);

      this.textures = new TextureStore(fallbackStore);
      this.samples = new SampleStore(resources.audioManager, fallbackStore);
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

        if (!texture)
          break;

        textures.push(texture);
      }
    }

    if (textures.length === 0) {
      const texture = this.getTexture(componentName);

      return new DrawableSprite({ texture });
    }

    return new DrawableSprite({ texture: textures[Math.floor(textures.length * 2 / 3)] });

    const animation = new SkinnableTextureAnimation(startAtCurrentTime);
    animation.loop = looping;
    animation.defaultFrameLength = 1000 / textures.length;

    for (const t of textures)
      animation.addFrame(t);

    return animation;
  }

  configuration!: SkinConfiguration;

  protected parseConfiguration(config: ArrayBuffer) {
    this.configuration = new StableSkinConfigurationDecoder().decode(config);
  }

  async getSample(channel: AudioChannel, name: string): Promise<Sample | null> {
    const sample = await this.samples?.getSample(channel, name);

    return sample ?? null;
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
