import type { HitSample } from '../hitsounds/HitSample';
import type { ISkin } from './ISkin';
import type { ISkinComponentLookup } from './ISkinComponentLookup';
import type { ISkinSource } from './ISkinSource';
import type { Skin } from './Skin';
import type { SkinConfig } from './SkinConfig';
import { Action, asyncDependencyLoader, type AudioChannel, Bindable, Component, type Drawable, type PIXITexture, resolved, type Sample } from '@osucad/framework';
import { OsucadConfigManager } from '../config/OsucadConfigManager';
import { IResourcesProvider } from '../io/IResourcesProvider';
import { DefaultSkin } from './default/DefaultSkin';

export class SkinManager extends Component implements ISkinSource {
  @resolved(IResourcesProvider)
  resources!: IResourcesProvider;

  #defaultSkin!: Skin;

  get defaultSkin(): Skin {
    return this.#defaultSkin;
  }

  readonly currentSkin = new Bindable<Skin>(null!);

  setActiveSkin(skin: Skin | null) {
    this.currentSkin.value = skin ?? this.defaultSkin;
  }

  @resolved(OsucadConfigManager)
  protected config!: OsucadConfigManager;

  @asyncDependencyLoader()
  async [Symbol('load')]() {
    await this.#loadDefaultSkin();
  }

  protected override loadAsyncComplete() {
    super.loadAsyncComplete();

    this.currentSkin.valueChanged.addListener(this.#skinChanged, this);
    this.#skinChanged();
  }

  async #loadDefaultSkin() {
    this.#defaultSkin = await this.loadDefaultSkin();
  }

  protected async loadDefaultSkin(): Promise<Skin> {
    const skin = new DefaultSkin(this.resources);
    await skin.load();
    console.log('loaded default skin');
    return skin;
  }

  #activeSources: ISkin[] = [];

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
    for (const source of this.#activeSources) {
      const result = source.getSample(channel, sampleInfo);
      if (result !== null)
        return result;
    }

    return null;
  }

  #skinChanged() {
    if (this.currentSkin.value === this.defaultSkin)
      this.#activeSources = [this.currentSkin.value, this.defaultSkin];
    else
      this.#activeSources = [this.defaultSkin];

    this.sourceChanged.emit();
  }

  getConfig<T>(key: SkinConfig<T>): T | null {
    for (const source of this.#activeSources) {
      const result = source.getConfig(key);
      if (result !== null)
        return result;
    }

    return null;
  }
}
