import { Action, Axes, Bindable, Container, ContainerOptions, Drawable, provide, ReadonlyDependencyContainer, ValueChangedEvent } from "@osucad/framework";
import { Color, Texture } from "pixi.js";
import { ISkin, SkinComponentLookup } from "./ISkin";
import { ISkinSource } from "./ISkinSource";
import { SkinConfigurationLookup, SkinConfigurationValue } from "./SkinConfiguration";

export interface SkinProvidingContainerOptions extends ContainerOptions {
  skin?: ISkin
}

@provide(ISkinSource)
export class SkinProvidingContainer extends Container implements ISkinSource {
  constructor(options: SkinProvidingContainerOptions = {}) {
    super();

    this.with({
      relativeSizeAxes: Axes.Both,
      ...options
    })
  }

  private readonly activeSkin = new Bindable<ISkin | null>(null)

  get skin() {
    return this.activeSkin.value
  }

  set skin(value) {
    this.activeSkin.value = value
  }

  #parentSource?: ISkinSource

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.#parentSource = dependencies.resolveOptional(ISkinSource)
  }

  protected override loadComplete() {
    super.loadComplete();

    this.activeSkin.bindValueChanged(this.#skinChanged, this)
  }

  readonly sourceChanged = new Action();

  protected get allSources() {
    const sources: ISkin[] = []

    if (this.skin)
      sources.push(this.skin)

    if (this.#parentSource)
      sources.push(this.#parentSource)

    return sources
  }

  getTexture(componentName: string): Texture | null {
    for (const source of this.allSources) {
      const texture = source.getTexture(componentName)
      if (texture)
        return texture
    }

    return null
  }

  getDrawableComponent(lookup: SkinComponentLookup): Drawable | null {
    for (const source of this.allSources) {
      const drawable = source.getDrawableComponent(lookup)
      if (drawable)
        return drawable
    }

    return null
  }

  getConfigValue<T extends SkinConfigurationLookup>(lookup: T): SkinConfigurationValue<T> | null {
    for (const source of this.allSources) {
      const value = source.getConfigValue(lookup)
      if (value)
        return value
    }

    return null
  }

  readonly #bindables = new Map<string, Bindable<any>>()
  readonly #sourceBindables = new Map<string, Bindable<any>>()

  getConfigBindable<T extends SkinConfigurationLookup>(lookup: T): Bindable<SkinConfigurationValue<T> | null> {
    const cached = this.#bindables.get(lookup)
    if (cached)
      return cached.getBoundCopy();

    const bindable = this.#getConfigBindable(lookup)
    const newBindable = bindable.getBoundCopy()

    this.#sourceBindables.set(lookup, bindable);
    this.#bindables.set(lookup, newBindable);

    return newBindable.getBoundCopy();
  }

  #getConfigBindable<T extends SkinConfigurationLookup>(lookup: T): Bindable<SkinConfigurationValue<T> | null> {
    for (const source of this.allSources) {
      const bindable = source.getConfigBindable(lookup)
      if (bindable) {
        return bindable
      }
    }

    return new Bindable(null) as any
  }

  getComboColor(comboIndex: number): Color {
    for (const source of this.allSources) {
      const value = source.getComboColor(comboIndex)
      if (value)
        return value
    }

    return new Color(0xffffff)
  }

  #skinChanged(evt: ValueChangedEvent<ISkin | null>) {
    for (const [lookup, bindable] of this.#bindables) {
      const sourceBindable = this.#sourceBindables.get(lookup)

      if (sourceBindable) {
        bindable.unbindFrom(sourceBindable)
        this.#sourceBindables.delete(lookup)
      }

      const newSourceBindable = this.#getConfigBindable(lookup as any)

      bindable.bindTo(newSourceBindable)
      this.#sourceBindables.set(lookup, newSourceBindable)
    }

    this.sourceChanged.emit()
  }
}