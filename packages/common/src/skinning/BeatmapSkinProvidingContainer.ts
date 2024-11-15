import type { Bindable, ReadonlyDependencyContainer } from 'osucad-framework';
import type { HitSample } from '../hitsounds/HitSample';
import type { ISkin } from './ISkin';
import type { Skin } from './Skin';
import { dependencyLoader } from 'osucad-framework';
import { OsucadConfigManager } from '../config/OsucadConfigManager';
import { OsucadSettings } from '../config/OsucadSettings';
import { SkinManager } from './SkinManager';
import { SkinProvidingContainer } from './SkinProvidingContainer';
import { StableSkin } from './stable/StableSkin';

export class BeatmapSkinProvidingContainer extends SkinProvidingContainer {
  #beatmapSkins!: Bindable<boolean>;
  #beatmapColors!: Bindable<boolean>;
  #beatmapHitsounds!: Bindable<boolean>;

  override get allowConfigurationLookup(): boolean {
    return this.#beatmapSkins.value;
  }

  override get allowColorLookup(): boolean {
    return this.#beatmapColors.value;
  }

  override allowTextureLookup(componentName: string): boolean {
    return this.#beatmapSkins.value;
  }

  override allowSampleLookup(sampleInfo: string | HitSample): boolean {
    return this.#beatmapHitsounds.value;
  }

  readonly #skin: ISkin;
  readonly #classicFallback: ISkin | null;

  #currentSkin!: Bindable<Skin>;

  constructor(skin: ISkin, classicFallback: ISkin | null) {
    super(skin);
    this.#skin = skin;
    this.#classicFallback = classicFallback;
  }

  @dependencyLoader()
  [Symbol('load')](dependencies: ReadonlyDependencyContainer) {
    const configManager = dependencies.resolve(OsucadConfigManager);
    const skins = dependencies.resolve(SkinManager);

    this.#beatmapSkins = configManager.getBindable(OsucadSettings.UseBeatmapSkins)!;
    this.#beatmapColors = configManager.getBindable(OsucadSettings.BeatmapComboColors)!;
    this.#beatmapHitsounds = configManager.getBindable(OsucadSettings.BeatmapHitSounds)!;

    this.#beatmapSkins.valueChanged.addListener(this.triggerSourceChanged, this);
    this.#beatmapColors.valueChanged.addListener(this.triggerSourceChanged, this);
    this.#beatmapHitsounds.valueChanged.addListener(this.triggerSourceChanged, this);

    this.#currentSkin = skins.currentSkin.getBoundCopy();
    this.#currentSkin.addOnChangeListener(() => {
      const userSkinIsLegacy = skins.currentSkin.value instanceof StableSkin;

      if (!userSkinIsLegacy && this.#classicFallback !== null)
        this.setSources([this.#skin, this.#classicFallback]);
      else
        this.setSources([this.#skin]);
    }, { immediate: true });
  }
}
