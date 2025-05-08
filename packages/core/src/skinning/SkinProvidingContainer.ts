import type { ContainerOptions, Drawable, ReadonlyDependencyContainer, Sample } from "@osucad/framework";
import { Action, Axes, computed, Container, provide, ref, watch, withEffectScope } from "@osucad/framework";
import type { Texture } from "pixi.js";
import { Color } from "pixi.js";
import type { ISampleInfo } from "../audio/ISampleInfo";
import type { ISkin } from "./ISkin";
import { ISkinSource } from "./ISkinSource";
import type { SkinConfigurationLookup, SkinConfigurationValue } from "./SkinConfiguration";
import type { SkinComponentLookup } from "./SkinComponentLookup";

export interface SkinProvidingContainerOptions extends ContainerOptions
{
  skin?: ISkin
}

@provide(ISkinSource)
export class SkinProvidingContainer extends Container implements ISkinSource
{
  constructor(options: SkinProvidingContainerOptions = {})
  {
    super();

    this.with({
      relativeSizeAxes: Axes.Both,
      ...options,
    });

    this.texturesChanged.addListener(() => this.sourceChanged.emit());

    watch(this.#allSources, (newSources: ISkin[], oldSources: ISkin[]) =>
    {
      for (const source of (oldSources ?? []))
        source.texturesChanged.removeListener(this.#triggerTexturesChanged);

      for (const source of newSources)
        source.texturesChanged.addListener(this.#triggerTexturesChanged);
    }, { immediate: true });
  }

  #triggerTexturesChanged = () => this.texturesChanged.emit();

  readonly texturesChanged = new Action();

  private readonly activeSkin = ref<ISkin | null>(null);

  #allSources = computed(() =>
  {
    const sources: ISkin[] = [];

    if (this.skin)
      sources.push(this.skin);

    if (this.#parentSource)
      sources.push(this.#parentSource);

    return sources;
  });


  get skin()
  {
    return this.activeSkin.value;
  }

  set skin(value)
  {
    this.activeSkin.value = value;
  }

  #parentSource?: ISkinSource;

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.#parentSource = dependencies.resolveOptional(ISkinSource);
  }

  @withEffectScope()
  protected override loadComplete()
  {
    super.loadComplete();

    watch(this.activeSkin, () => this.#skinChanged());
  }

  readonly sourceChanged = new Action();

  protected get allSources()
  {
    return this.#allSources.value;
  }

  getTexture(componentName: string): Texture | null
  {
    for (const source of this.allSources)
    {
      const texture = source.getTexture(componentName);
      if (texture)
        return texture;
    }

    return null;
  }

  getSample(sampleInfo: ISampleInfo): Sample | null
  {
    for (const source of this.allSources)
    {
      const sample = source.getSample(sampleInfo);
      if (sample)
        return sample;
    }

    return null;
  }

  getDrawableComponent(lookup: SkinComponentLookup): Drawable | null
  {
    for (const source of this.allSources)
    {
      const drawable = source.getDrawableComponent(lookup);
      if (drawable)
        return drawable;
    }

    return null;
  }

  getConfig<T extends SkinConfigurationLookup>(lookup: T): SkinConfigurationValue<T> | null
  {
    for (const source of this.allSources)
    {
      const value = source.getConfig(lookup);
      if (value !== null)
        return value;
    }

    return null;
  }

  getComboColor(comboIndex: number): Color
  {
    for (const source of this.allSources)
    {
      const value = source.getComboColor(comboIndex);
      if (value)
        return value;
    }

    return new Color(0xffffff);
  }

  #skinChanged()
  {
    this.sourceChanged.emit();
  }

  public findProvider(predicate: (skin: ISkin) => boolean): ISkin | null
  {
    return this.allSources.find(predicate) ?? null;
  }
}
