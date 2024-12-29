import type { AudioChannel, Drawable, ReadonlyDependencyContainer, Sample } from 'osucad-framework';
import type { Texture } from 'pixi.js';
import type { HitSample } from '../hitsounds/HitSample';
import type { ISkin } from './ISkin';
import type { ISkinComponentLookup } from './ISkinComponentLookup';
import type { SkinConfigurationLookup } from './SkinConfigurationLookup';
import { Action, Axes, Container, DependencyContainer, dependencyLoader } from 'osucad-framework';
import { ISkinSource } from './ISkinSource';
import { SkinComboColorLookup } from './SkinComboColorLookup';

export class SkinProvidingContainer extends Container implements ISkinSource {
  readonly sourceChanged = new Action();

  #parentSource!: ISkinSource | null;

  get parentSource(): ISkinSource | null {
    return this.#parentSource;
  }

  protected get allowFallingBackToParent(): boolean {
    return true;
  }

  allowDrawableLookup(lookup: ISkinComponentLookup): boolean {
    return true;
  }

  allowTextureLookup(componentName: string): boolean {
    return true;
  }

  allowSampleLookup(sampleInfo: string | HitSample): boolean {
    return true;
  }

  get allowConfigurationLookup(): boolean {
    return true;
  }

  get allowColorLookup(): boolean {
    return true;
  }

  #skinSources: { skin: ISkin; wrapped: DisableableSkinSource }[] = [];

  constructor(skin?: ISkin) {
    super();
    this.relativeSizeAxes = Axes.Both;

    if (skin)
      this.setSources([skin]);
  }

  protected override createChildDependencies(parentDependencies: ReadonlyDependencyContainer): DependencyContainer {
    const dependencies = new DependencyContainer(parentDependencies);

    dependencies.provide(ISkinSource, this);

    return dependencies;
  }

  @dependencyLoader()
  [Symbol('load')](dependencies: DependencyContainer) {
    this.#parentSource = dependencies.resolveOptional(ISkinSource);
    if (this.#parentSource)
      this.#parentSource.sourceChanged.addListener(this.triggerSourceChanged, this);

    this.triggerSourceChanged();
  }

  findProvider(lookupFunction: (skin: ISkin) => boolean): ISkin | null {
    for (const { skin, wrapped } of this.#skinSources) {
      if (lookupFunction(wrapped))
        return skin;
    }

    if (!this.allowFallingBackToParent)
      return null;

    return this.parentSource?.findProvider(lookupFunction) ?? null;
  }

  get allSources(): ISkin[] {
    const sources: ISkin[] = [];
    for (const { skin } of this.#skinSources)
      sources.push(skin);

    if (this.allowFallingBackToParent && this.parentSource)
      sources.push(...this.parentSource.allSources);

    return sources;
  }

  getDrawableComponent(lookup: ISkinComponentLookup): Drawable | null {
    for (const { wrapped } of this.#skinSources) {
      const sourceDrawable = wrapped.getDrawableComponent(lookup);
      if (sourceDrawable != null)
        return sourceDrawable;
    }

    if (!this.allowFallingBackToParent)
      return null;

    return this.parentSource?.getDrawableComponent(lookup) ?? null;
  }

  getTexture(componentName: string): Texture | null {
    for (const { wrapped } of this.#skinSources) {
      const sourceTexture = wrapped.getTexture(componentName);
      if (sourceTexture != null)
        return sourceTexture;
    }

    if (!this.allowFallingBackToParent)
      return null;

    return this.parentSource?.getTexture(componentName) ?? null;
  }

  getSample(channel: AudioChannel, sampleInfo: string | HitSample): Sample | null {
    for (const { wrapped } of this.#skinSources) {
      const sourceSample = wrapped.getSample(channel, sampleInfo);
      if (sourceSample != null)
        return sourceSample;
    }

    if (!this.allowFallingBackToParent)
      return null;

    return this.parentSource?.getSample(channel, sampleInfo) ?? null;
  }

  getConfig<T>(lookup: SkinConfigurationLookup<T>): T | null {
    for (const { wrapped } of this.#skinSources) {
      const sourceConfig = wrapped.getConfig(lookup);
      if (sourceConfig != null)
        return sourceConfig;
    }

    if (!this.allowFallingBackToParent)
      return null;

    return this.parentSource?.getConfig(lookup) ?? null;
  }

  protected setSources(sources: ISkin[]) {
    for (const skin of this.#skinSources) {
      if (this.#isSkinSource(skin.skin))
        skin.skin.sourceChanged.removeListener(this.triggerSourceChanged, this);
    }

    this.#skinSources = sources.map(skin => ({
      skin,
      wrapped: new DisableableSkinSource(skin, this),
    }));

    for (const skin of this.#skinSources) {
      if (this.#isSkinSource(skin.skin))
        skin.skin.sourceChanged.addListener(this.triggerSourceChanged, this);
    }
  }

  protected refreshSources() {}

  protected triggerSourceChanged() {
    this.refreshSources();

    this.sourceChanged.emit();
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.sourceChanged.removeAllListeners();

    if (this.parentSource !== null)
      this.parentSource.sourceChanged.removeListener(this.triggerSourceChanged, this);

    for (const skin of this.#skinSources) {
      if (this.#isSkinSource(skin.skin))
        skin.skin.sourceChanged.removeListener(this.triggerSourceChanged, this);
    }
  }

  #isSkinSource(skin: ISkin): skin is ISkinSource {
    return skin && 'sourceChanged' in skin;
  }
}

class DisableableSkinSource implements ISkin {
  constructor(readonly skin: ISkin, readonly provider: SkinProvidingContainer) {}

  getDrawableComponent(lookup: ISkinComponentLookup): Drawable | null {
    if (this.provider.allowDrawableLookup(lookup))
      return this.skin.getDrawableComponent(lookup);

    return null;
  }

  getTexture(componentName: string): Texture | null {
    if (this.provider.allowTextureLookup(componentName))
      return this.skin.getTexture(componentName);

    return null;
  }

  getSample(channel: AudioChannel, sampleInfo: string | HitSample): Sample | null {
    if (this.provider.allowSampleLookup(sampleInfo))
      return this.skin.getSample(channel, sampleInfo);

    return null;
  }

  getConfig<T>(key: SkinConfigurationLookup<T>): T | null {
    if (key instanceof SkinComboColorLookup) {
      if (this.provider.allowColorLookup)
        return this.skin.getConfig(key) as any;

      return null;
    }

    if (this.provider.allowConfigurationLookup)
      return this.skin.getConfig(key);

    return null;
  }

  toString() {
    return `DisableableSkinSource { Skin: ${this.skin} }`;
  }

  dispose() {
  }
}
