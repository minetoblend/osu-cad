import type { Drawable } from '../graphics/drawables/Drawable';

export class DependencyContainer implements ReadonlyDependencyContainer {
  private readonly dependencies = new Map<any, any>();

  constructor(private readonly parent?: ReadonlyDependencyContainer) {}

  public owner: Drawable | null = null;

  provide(keyOrValue: any, value?: any): void {
    if (!value && typeof keyOrValue === 'object' && 'constructor' in keyOrValue) {
      this.dependencies.set(keyOrValue.constructor, keyOrValue);
      return;
    }

    this.dependencies.set(keyOrValue, value);
  }

  resolveOptional<T>(key: new (...args: any[]) => T): T;
  resolveOptional<T>(key: InjectionToken<T>): T;
  resolveOptional<T>(key: any): T | undefined {
    if (this.dependencies.has(key)) {
      return this.dependencies.get(key);
    }

    return this.parent?.resolveOptional<T>(key);
  }

  resolve<T>(key: new (...args: any[]) => T): T;
  resolve<T>(key: InjectionToken<T>): T;
  resolve<T>(key: any): T {
    const value = this.resolveOptional<T>(key);

    if (value === undefined) {
      if (typeof key === 'object' && 'name' in key) {
        key = key.name;
      }

      throw new Error(`Could not resolve dependency for key: ${key}`);
    }

    return value;
  }
}

export interface ReadonlyDependencyContainer {
  resolveOptional: <T>(key: new (...args: any[]) => T) => T;

  resolve: (<T>(key: new (...args: any[]) => T) => T) & (<T>(key: InjectionToken<T>) => T);
}

// eslint-disable-next-line ts/no-wrapper-object-types
export interface InjectionToken<T> extends Symbol {}

export function injectionToken<T>(description?: string): InjectionToken<T> {
  return Symbol(description);
}
