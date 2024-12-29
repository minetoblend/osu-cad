import type { LoadableSkin, SkinStore } from '../environment/SkinStore';
import { OsucadSettings, SkinManager } from '@osucad/common';
import { asyncDependencyLoader, Bindable } from 'osucad-framework';

export class OsucadSkinManager extends SkinManager {
  constructor(skinStore: SkinStore) {
    super();
    this.#skinStore = skinStore;
  }

  readonly #skinStore: SkinStore;

  get skins() {
    return this.#skinStore.skins.value;
  }

  private readonly activeSkinName = new Bindable<string | null>(null);

  readonly loadingSkin = new Bindable<LoadableSkin | null>(null);

  @asyncDependencyLoader()
  async [Symbol('load')]() {
    this.config.bindWith(OsucadSettings.Skin, this.activeSkinName);

    await this.#loadInitialSkin();
  }

  async #loadInitialSkin() {
    const skinName = this.activeSkinName.value;

    if (!skinName)
      return;

    const skin = this.skins.find(it => it.name === skinName);
    if (skin)
      await this.loadSkin(skin);
  }

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
        const oldSkin = this.currentSkin.value;
        if (oldSkin !== this.defaultSkin)
          this.schedule(() => oldSkin.dispose());

        this.currentSkin.value = loadedSkin;
        this.loadingSkin.value = null;
        return true;
      }
    }
    catch (e) {
      console.warn('Failed to load skin', e);
    }
    return false;
  }
}
