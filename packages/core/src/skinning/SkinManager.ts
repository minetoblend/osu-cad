import type { AudioChannel, Drawable, PIXITexture, ReadonlyDependencyContainer, Sample } from '@osucad/framework';
import type { HitSample } from '../hitsounds/HitSample';
import type { ISkin } from './ISkin';
import type { ISkinComponentLookup } from './ISkinComponentLookup';
import type { ISkinSource } from './ISkinSource';
import type { Skin } from './Skin';
import type { SkinConfig } from './SkinConfig';
import { LazyLoaded } from '@osucad/editor/utils/LazyLoaded';
import { Action, Bindable, Component, resolved } from '@osucad/framework';
import { OsucadConfigManager } from '../config/OsucadConfigManager';
import { OsucadSettings } from '../config/OsucadSettings';
import { IResourcesProvider } from '../io/IResourcesProvider';
import { ArgonSkin } from './argon/ArgonSkin';
import { DefaultSkin } from './default/DefaultSkin';

export class SkinManager extends Component implements ISkinSource {
  @resolved(IResourcesProvider)
  resources!: IResourcesProvider;

  #defaultClassicSkin!: Skin;

  get defaultClassicSkin(): Skin {
    return this.#defaultClassicSkin;
  }

  readonly currentSkin = new Bindable<Skin>(null!);

  setActiveSkin(skin: Skin) {
    this.currentSkin.value = skin;
  }

  @resolved(OsucadConfigManager)
  protected config!: OsucadConfigManager;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.activeSkinName = this.config.getBindable(OsucadSettings.Skin)!;
  }

  protected override get hasAsyncLoader(): boolean {
    return true;
  }

  protected override async loadAsync(dependencies: ReadonlyDependencyContainer): Promise<void> {
    await super.loadAsync(dependencies);

    await this.#loadBaseSkins();
  }

  protected override loadAsyncComplete() {
    super.loadAsyncComplete();

    this.currentSkin.valueChanged.addListener(this.#skinChanged, this);
    this.#skinChanged();
  }

  async #loadBaseSkins() {
    await Promise.all([
      this.#loadCurrentSkin(),
      this.#baseSkins.stable.load(),
    ]);
  }

  #baseSkins = {
    stable: new LazyLoaded(async () => {
      const skin = new DefaultSkin(this.resources);
      await skin.load();
      return skin;
    }),
    argon: new LazyLoaded(async () => {
      const skin = new ArgonSkin(this.resources);
      await skin.load();
      return skin;
    }),
  };

  #loadId = 0;

  async #loadCurrentSkin() {
    let skinPromise: Promise<Skin>;

    const id = ++this.#loadId;

    switch (this.activeSkinName.value) {
      case 'argon':
        skinPromise = this.#baseSkins.argon.load();
        break;
      default:
        skinPromise = this.#baseSkins.stable.load();
        break;
    }

    const skin = await skinPromise;
    console.log(skin);

    if (id === this.#loadId)
      this.setActiveSkin(skin);
  }

  #activeSources: ISkin[] = [];

  sourceChanged = new Action();

  activeSkinName !: Bindable<string>;

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
    this.#activeSources = [this.currentSkin.value];

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
