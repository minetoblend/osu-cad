import {Container, DestroyOptions} from "pixi.js";
import {DependencyContainer, getInjectionMetadata, InjectionMetadata} from "./di";
import {Constructor} from "@osucad/common";
import {effectScope, EffectScope, InjectionKey} from "vue";


export class Drawable extends Container {

  readonly isDrawable = true;

  private _isLoaded = false;

  needsLoad = false;

  private _dependencies?: DependencyContainer;

  effectScope?: EffectScope;

  constructor() {
    super();
    this.once("added", () => this._markForLoad());
  }

  get isLoaded() {
    return this._isLoaded;
  }


  updateChildDrawables = true;

  load(parent?: Drawable) {
    this.effectScope = effectScope();

    this.effectScope.run(() => {
      this._dependencies = new DependencyContainer(parent?._dependencies);
      const metadata = getInjectionMetadata(this, false);
      if (metadata)
        this._autoInject(metadata);

      this.onLoad?.();

      if (metadata)
        this._autoProvide(metadata);

      this._isLoaded = true;
    });

    for (const child of this.children) {
      if (isDrawable(child)) {
        child.load(this);
      }
    }
  }

  private _autoInject(metadata: InjectionMetadata) {
    for (const { key, propertyKey } of metadata.inject) {
      this[propertyKey as keyof this] = this._dependencies!.inject(key);
    }
  }

  private _autoProvide(metadata: InjectionMetadata) {
    for (const { key, propertyKey } of metadata.provide) {
      const value = this[propertyKey as keyof this];
      if (value === undefined) {
        throw new Error(`Cannot provide uninitialized value for ${key}`);
      }
      this._dependencies!.provide(key, value);
    }
  }

  onLoad?(): void

  onTick?(): void

  private _markForLoad(fromChild = false) {
    this.needsLoad = true;
    let parent = this.parent;
    while (parent) {
      if (isDrawable(parent)) {
        if (!fromChild && parent.isLoaded) {
          try {
            this.load(parent);
          } catch (e) {
            console.error("Error loading drawable", this, e);
          }
        }

        parent._markForLoad(true);
        return;
      }
      parent = parent.parent;
    }

  }

  provide(key: unknown, value: unknown) {
    if (!this._dependencies)
      throw new Error("Cannot provide dependency before load");
    this._dependencies.provide(key, value);
  }

  inject<T>(key: Constructor<T>, optional?: false): T;
  inject<T>(key: Constructor<T>, optional: boolean): T | undefined;
  inject<T>(key: InjectionKey<T>, optional?: false): T;
  inject<T>(key: InjectionKey<T>, optional: boolean): T | undefined;
  inject<T>(key: unknown, optional?: false): T;
  inject<T>(key: unknown, optional: boolean): T | undefined;

  inject(key: unknown, optional = false): any {
    if (!this._dependencies)
      throw new Error("Cannot inject dependency before load");
    return this._dependencies.inject(key, optional);
  }

  destroy(options?: DestroyOptions) {
    super.destroy(options);
    this.effectScope?.stop();
  }

}

export function isDrawable(object: Container): object is Drawable {
  return (object as any).isDrawable;
}