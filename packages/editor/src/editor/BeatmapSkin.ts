import type { AudioChannel, Drawable, PIXITexture, Sample } from 'osucad-framework';
import type { HitSample } from '../beatmap/hitSounds/HitSample.ts';
import type { ISkin } from '../skinning/ISkin.ts';
import type { ISkinComponentLookup } from '../skinning/ISkinComponentLookup.ts';
import type { ISkinSource } from '../skinning/ISkinSource.ts';
import type { SkinInfo } from '../skinning/SkinInfo.ts';
import { Action, asyncDependencyLoader, Bindable, BindableBoolean, resolved } from 'osucad-framework';
import { Beatmap } from '../beatmap/Beatmap.ts';
import { OsucadConfigManager } from '../config/OsucadConfigManager.ts';
import { OsucadSettings } from '../config/OsucadSettings.ts';
import { IResourcesProvider } from '../io/IResourcesProvider.ts';
import { SkinConfig } from '../skinning/SkinConfig.ts';
import { SkinTransformer } from '../skinning/SkinTransformer.ts';
import { StableSkin } from '../skinning/stable/StableSkin.ts';
import { EditorContext } from './context/EditorContext.ts';

export class BeatmapSkin extends SkinTransformer implements ISkinSource {
  constructor(source: ISkinSource) {
    super(source);
  }

  declare source: ISkinSource;

  @resolved(Beatmap)
  beatmap!: Beatmap;

  @resolved(EditorContext)
  context!: EditorContext;

  @resolved(OsucadConfigManager)
  config!: OsucadConfigManager;

  @resolved(IResourcesProvider)
  resources!: IResourcesProvider;

  useBeatmapSkins = new BindableBoolean(true);

  useBeatmapComboColors = new BindableBoolean(true);

  useBeatmapHitSounds = new BindableBoolean(true);

  @asyncDependencyLoader()
  async load() {
    this.config.bindWith(OsucadSettings.UseBeatmapSkins, this.useBeatmapSkins);
    this.config.bindWith(OsucadSettings.BeatmapComboColors, this.useBeatmapComboColors);
    this.config.bindWith(OsucadSettings.BeatmapHitSounds, this.useBeatmapHitSounds);

    this.useBeatmapComboColors.valueChanged.addListener(this.#skinChanged, this);
    this.useBeatmapSkins.valueChanged.addListener(this.#skinChanged, this);
    this.source.sourceChanged.addListener(this.#skinChanged, this);

    const skinInfo: SkinInfo = {
      name: `${this.beatmap.metadata.title} ${this.beatmap.metadata.artist}`,
      creator: this.beatmap.metadata.creator,
    };

    try {
      const skin = new StableSkin(skinInfo, this.resources, this.context.resources);

      await skin.load();

      this.beatmapSkin = skin;
    }
    catch (e) {
    }
  }

  beatmapSkin!: ISkin | null;

  #skinChanged() {
    this.sourceChanged.emit();
  }

  sourceChanged = new Action();

  findProvider(lookupFunction: (skin: ISkin) => boolean): ISkin | null {
    if (!this.useBeatmapSkins.value)
      return this.source.findProvider(lookupFunction);

    return this.allSources.find(lookupFunction) ?? null;
  }

  get allSources(): ISkin[] {
    if (this.beatmapSkin && this.useBeatmapSkins.value) {
      return [this.beatmapSkin, this.source];
    }

    return [this.source];
  }

  get sampleSources() {
    if (this.beatmapSkin && this.useBeatmapHitSounds.value)
      return [this.beatmapSkin, this.source];

    return [this.source];
  }

  getDrawableComponent(lookup: ISkinComponentLookup): Drawable | null {
    if (this.useBeatmapSkins.value) {
      const result = this.beatmapSkin?.getDrawableComponent(lookup);

      if (result)
        return result;
    }

    return super.getDrawableComponent(lookup);
  }

  getTexture(componentName: string): PIXITexture | null {
    if (this.useBeatmapSkins.value) {
      const result = this.beatmapSkin?.getTexture(componentName);

      if (result)
        return result;
    }

    return super.getTexture(componentName);
  }

  getSample(channel: AudioChannel, sample: string | HitSample): Sample | null {
    if (typeof sample === 'string')
      return this.#getSample(channel, sample);

    const sampleName = sample.sampleName;
    if (!sampleName)
      return null;

    if (sample.index === 0) { // If the sample index is 0 we don't want to use any custom samples
      return this.source.getSample(channel, sampleName);
    }

    return this.#getSample(channel, sampleName + sample.index) ?? this.#getSample(channel, sampleName);
  }

  #getSample(channel: AudioChannel, name: string) {
    for (const source of this.sampleSources) {
      const result = source.getSample(channel, name);
      if (result !== null) {
        return result;
      }
    }

    return null;
  }

  getConfig<T>(key: SkinConfig<T>): Bindable<T> | null {
    switch (key) {
      case SkinConfig.ComboColors:
        if (this.useBeatmapComboColors.value)
          return new Bindable(this.beatmap.colors.comboColors) as any;
    }

    for (const source of this.source.allSources) {
      const result = source.getConfig(key);
      if (result !== null)
        return result;
    }

    return null;
  }

  override dispose(isDisposing: boolean = true) {
    this.source.sourceChanged.removeListener(this.#skinChanged, this);

    this.beatmapSkin?.dispose();

    super.dispose(isDisposing);
  }
}
