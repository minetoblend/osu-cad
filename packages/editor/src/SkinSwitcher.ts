import type {
  AudioChannel,
  Bindable,
  Drawable,
  KeyDownEvent,
  Sample,
} from 'osucad-framework';
import type { Texture } from 'pixi.js';
import type { SkinProvider, SkinStore } from './environment';
import type { ISkin } from './skinning/ISkin';
import type { ISkinComponentLookup } from './skinning/ISkinComponentLookup';
import type { ISkinSource } from './skinning/ISkinSource';
import type { SkinConfig } from './skinning/SkinConfig.ts';
import {
  Action,
  asyncDependencyLoader,
  Axes,
  CompositeDrawable,
  Key,
  resolved,
} from 'osucad-framework';
import { IResourcesProvider } from './io/IResourcesProvider';
import { createDefaultSkin } from './skinning/CreateDefaultSkin';

export class SkinSwitcher extends CompositeDrawable implements ISkinSource {
  constructor(readonly skinStore: SkinStore) {
    super();
    this.relativeSizeAxes = Axes.Both;
  }

  @resolved(IResourcesProvider)
  resources!: IResourcesProvider;

  defaultSkin!: ISkin;

  activeSources!: ISkin[];

  #activeSkin: ISkin | null = null;

  get activeSkin() {
    return this.#activeSkin;
  }

  set activeSkin(value: ISkin | null) {
    if (this.#activeSkin === value)
      return;

    this.#activeSkin = value;
    this.activeSources = value ? [value, this.defaultSkin] : [this.defaultSkin];

    this.sourceChanged.emit();
  }

  @asyncDependencyLoader()
  async load() {
    this.defaultSkin = await createDefaultSkin(this.resources);
    this.activeSources = [this.defaultSkin];
  }

  readonly sourceChanged = new Action();

  findProvider(lookupFunction: (skin: ISkin) => boolean): ISkin | null {
    return this.activeSources.find(lookupFunction) ?? null;
  }

  get allSources(): ISkin[] {
    return this.activeSources;
  }

  getDrawableComponent(lookup: ISkinComponentLookup): Drawable | null {
    for (const source of this.activeSources) {
      const component = source.getDrawableComponent(lookup);
      if (component)
        return component;
    }

    return null;
  }

  getTexture(componentName: string): Texture | null {
    for (const source of this.activeSources) {
      const texture = source.getTexture(componentName);
      if (texture)
        return texture;
    }

    return null;
  }

  async getSample(channel: AudioChannel, name: string): Promise<Sample | null> {
    for (const source of this.activeSources) {
      const sample = await source.getSample(channel, name);
      if (sample)
        return sample;
    }

    return null;
  }

  #activeSkinProvider: SkinProvider | null = null;

  async loadSkin(skin: SkinProvider) {
    const previousSkin = this.#activeSkin;

    console.log('Loading skin', skin.name);

    try {
      this.activeSkin = await skin.loadSkin(this.resources);
      this.#activeSkinProvider = skin;

      console.log('Loaded skin', skin.name);

      if (previousSkin) {
        this.scheduler.addDelayed(() => previousSkin.dispose(), 1000);
      }
    }
    catch (e) {
      console.error(e);
    }
  }

  loadNextSkin() {
    const index = this.skinStore.skins.value.indexOf(this.#activeSkinProvider!);

    console.log(index);

    const nextIndex = (index + 1) % this.skinStore.skins.value.length;

    const skin = this.skinStore.skins.value[nextIndex];

    if (!skin)
      return;

    this.loadSkin(skin);
  }

  onKeyDown(e: KeyDownEvent): boolean {
    if (e.key === Key.F8) {
      this.loadNextSkin();
      return true;
    }

    return false;
  }

  getConfig<T>(key: SkinConfig<T>): Bindable<T> | null {
    for (const skin of this.activeSources) {
      const value = skin.getConfig(key);
      if (value)
        return value;
    }
    return null;
  }
}
