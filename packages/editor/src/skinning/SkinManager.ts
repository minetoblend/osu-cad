import type {
  AudioChannel,
  Drawable,
  PIXITexture,
  Sample,
} from 'osucad-framework';
import type { HitSample } from '../beatmap/hitSounds/HitSample.ts';
import type { LoadableSkin, SkinStore } from '../environment';
import type { ISkin } from './ISkin.ts';
import type { ISkinComponentLookup } from './ISkinComponentLookup.ts';
import type { ISkinSource } from './ISkinSource.ts';
import type { Skin } from './Skin.ts';
import type { SkinConfig } from './SkinConfig.ts';

import {
  Action,
  asyncDependencyLoader,
  Bindable,
  BindableBoolean,
  BindableWithCurrent,
  Component,
  resolved,
} from 'osucad-framework';
import { OsucadConfigManager } from '../config/OsucadConfigManager.ts';
import { OsucadSettings } from '../config/OsucadSettings.ts';
import { IResourcesProvider } from '../io/IResourcesProvider.ts';
import { createDefaultSkin } from './CreateDefaultSkin.ts';

export class SkinManager extends Component implements ISkinSource {
  constructor(skinStore: SkinStore) {
    super();
    this.#skinStore = skinStore;
  }

  @resolved(IResourcesProvider)
  resources!: IResourcesProvider;

  readonly #skinStore: SkinStore;

  get skins() {
    return this.#skinStore.skins.value;
  }

  #defaultSkin!: Skin;

  private readonly activeSkinName = new Bindable<string | null>(null);

  readonly activeSkin = new Bindable<ISkin | null>(null);

  readonly loadingSkin = new Bindable<LoadableSkin | null>(null);

  readonly useSkinHitSounds = new BindableBoolean(true);

  setActiveSkin(skin: ISkin | null) {
    this.activeSkin.value = skin;
  }

  @resolved(OsucadConfigManager)
  private config!: OsucadConfigManager;

  @asyncDependencyLoader()
  async load() {
    this.config.bindWith(OsucadSettings.Skin, this.activeSkinName);
    this.config.bindWith(OsucadSettings.UseSkinHitSounds, this.useSkinHitSounds);

    await Promise.all([
      this.#loadDefaultSkin(),
      this.#loadInitialSkin(),
    ]);

    this.activeSkin.valueChanged.addListener(this.#skinChanged, this);
    this.#skinChanged();
  }

  async #loadDefaultSkin() {
    this.#defaultSkin = await createDefaultSkin(this.resources);
  }

  async #loadInitialSkin() {
    const skinName = this.activeSkinName.value;

    if (!skinName)
      return;

    const skin = this.skins.find(it => it.name === skinName);
    if (skin)
      await this.loadSkin(skin);
  }

  #activeSources: ISkin[] = [];

  #skinLoadAbortController: AbortController | null = null;

  async loadSkin(skin: LoadableSkin): Promise<boolean> {
    if (this.#skinLoadAbortController) {
      this.#skinLoadAbortController.abort();
      this.#skinLoadAbortController = null;
    }

    const controller = this.#skinLoadAbortController = new AbortController();

    return this.#loadSkin(skin, controller.signal);
  }

  async #loadSkin(skin: LoadableSkin, signal: AbortSignal): Promise<boolean> {
    try {
      this.loadingSkin.value = skin;
      const loadedSkin = await skin.loadSkin(this.resources);
      if (!signal.aborted) {
        const oldSkin = this.activeSkin.value;
        if (oldSkin)
          this.schedule(() => oldSkin.dispose());

        this.activeSkin.value = loadedSkin;
        this.loadingSkin.value = null;
        return true;
      }
    }
    catch (e) {
      console.warn('Failed to load skin', e);
    }
    return false;
  }

  sourceChanged = new Action();

  findProvider(lookupFunction: (skin: ISkin) => boolean): ISkin | null {
    for (const source of this.#activeSources) {
      if (lookupFunction(source))
        return source;
    }

    return null;
  }

  get allSources(): ISkin[] {
    return this.#activeSources;
  }

  getDrawableComponent(lookup: ISkinComponentLookup): Drawable | null {
    for (const source of this.#activeSources) {
      const result = source.getDrawableComponent(lookup);
      if (result !== null)
        return result;
    }

    return null;
  }

  getTexture(componentName: string): PIXITexture | null {
    for (const source of this.#activeSources) {
      const result = source.getTexture(componentName);
      if (result !== null)
        return result;
    }

    return null;
  }

  getSample(channel: AudioChannel, sampleInfo: string | HitSample): Sample | null {
    if (!this.useSkinHitSounds.value)
      return this.#defaultSkin.getSample(channel, sampleInfo);

    for (const source of this.#activeSources) {
      const result = source.getSample(channel, sampleInfo);
      if (result !== null)
        return result;
    }

    return null;
  }

  #configMap = new Map<SkinConfig<any>, BindableWithCurrent<any>>();

  #skinChanged() {
    if (this.activeSkin.value)
      this.#activeSources = [this.activeSkin.value, this.#defaultSkin];
    else
      this.#activeSources = [this.#defaultSkin];

    for (const [key, value] of this.#configMap.entries()) {
      value.unbindFromCurrent();

      try {
        for (const source of this.#activeSources) {
          const bindable = source.getConfig(key);
          if (bindable) {
            value.current = bindable;
            break;
          }
        }
      }
      catch (e) {
        console.error('Error when rebinding skin config', e);
      }
    }

    this.sourceChanged.emit();
  }

  getConfig<T>(key: SkinConfig<T>): Bindable<T> | null {
    if (this.#configMap.has(key))
      return this.#configMap.get(key)!;

    for (const source of this.#activeSources) {
      const result = source.getConfig(key);
      if (result) {
        const bindable = new BindableWithCurrent<T>(result.value);
        bindable.current = result;

        this.#configMap.set(key, bindable);

        return result;
      }
    }

    return null;
  }

  override dispose(isDisposing: boolean = true) {
    for (const bindable of this.#configMap.values()) {
      bindable.unbindAll();
    }

    super.dispose(isDisposing);
  }
}
