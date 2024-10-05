import type {
  AudioChannel,
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
import { Action, Anchor, asyncDependencyLoader, Axes, Bindable, BindableBoolean, Box, CompositeDrawable, Container, dependencyLoader, EasingFunction, Key, MaskingContainer, resolved } from 'osucad-framework';
import { OsucadConfigManager } from './config/OsucadConfigManager.ts';
import { OsucadSettings } from './config/OsucadSettings.ts';
import { IResourcesProvider } from './io/IResourcesProvider';
import { OsucadSpriteText } from './OsucadSpriteText.ts';
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

  @resolved(OsucadConfigManager)
  config!: OsucadConfigManager;

  useSkinHitSounds = new BindableBoolean(true);

  @asyncDependencyLoader()
  async load() {
    this.config.bindWith(OsucadSettings.UseSkinHitSounds, this.useSkinHitSounds);

    this.defaultSkin = await createDefaultSkin(this.resources);
    this.activeSources = [this.defaultSkin];

    this.relativeSizeAxes = Axes.Both;

    const initialSkinName = this.config.get(OsucadSettings.Skin) ?? null;

    if (initialSkinName) {
      const skin = this.skinStore.skins.value.find(it => it.name === initialSkinName);
      if (skin)
        await this.loadSkin(skin);
    }

    this.loadingSkin.valueChanged.addListener((evt) => {
      if (this.#skinLoadingOverlay) {
        this.#skinLoadingOverlay.hide();
        this.#skinLoadingOverlay.expire();
        this.#skinLoadingOverlay = null;
      }

      if (evt.value)
        this.addInternal(this.#skinLoadingOverlay = new SkinLoadingOverlay(evt.value));
    });
  }

  #skinLoadingOverlay: SkinLoadingOverlay | null = null;

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

  getSample(channel: AudioChannel, name: string): Sample | null {
    if (!this.useSkinHitSounds.value)
      return this.defaultSkin.getSample(channel, name);

    for (const source of this.activeSources) {
      const sample = source.getSample(channel, name);
      if (sample)
        return sample;
    }

    return null;
  }

  #activeSkinProvider: SkinProvider | null = null;

  loadingSkin = new Bindable<SkinProvider | null>(null);

  async loadSkin(skin: SkinProvider) {
    if (this.loadingSkin.value)
      return;

    const previousSkin = this.#activeSkin;

    this.loadingSkin.value = skin;

    console.log('Loading skin', skin.name);

    try {
      this.activeSkin = await skin.loadSkin(this.resources);
      this.#activeSkinProvider = skin;

      if (previousSkin)
        this.scheduler.addDelayed(() => previousSkin.dispose(), 1000);
    }
    catch (e) {
      console.error(e);
    }

    this.loadingSkin.value = null;
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

class SkinLoadingOverlay extends MaskingContainer {
  constructor(readonly skin: SkinProvider) {
    super();
  }

  @dependencyLoader()
  load() {
    this.autoSizeAxes = Axes.Y;
    this.width = 500;

    this.anchor = Anchor.BottomLeft;
    this.origin = Anchor.BottomLeft;

    this.x = 50;
    this.y = -50;

    this.cornerRadius = 6;

    this.addAllInternal(
      new Box({
        relativeSizeAxes: Axes.Both,
        color: 0x222228,
        alpha: 0.9,
      }),
      new Container({
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        padding: 18,
        children: [
          new OsucadSpriteText({
            text: `Loading skin ${this.skin.name}...`,
            fontSize: 20,
            anchor: Anchor.CenterLeft,
            origin: Anchor.CenterLeft,
          }),
        ],
      }),
    );
  }

  protected loadComplete() {
    super.loadComplete();

    this
      .moveToX(-50)
      .moveToX(50, 500, EasingFunction.OutExpo)
      .fadeInFromZero(500, EasingFunction.OutQuad);
  }

  hide() {
    this
      .moveToX(-50, 350, EasingFunction.OutExpo)
      .fadeOut(350, EasingFunction.OutQuad);
  }
}
