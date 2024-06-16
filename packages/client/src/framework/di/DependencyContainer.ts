// @ts-ignore
export interface InjectionKey<T> extends symbol {}

export type Constructor<T> = new (...args: any[]) => T;

export class DependencyContainer {
  constructor(private readonly _parent?: DependencyContainer) {}

  private _dependencies = new Map<any, any>();

  provide<T extends { constructor: Function }>(value: T): void;
  provide<T extends { constructor: Function }>(
    key: new (...args: any[]) => T,
    value: T,
  ): void;
  provide<T>(key: InjectionKey<T>, value: T): void;
  provide(keyOrValue: any, value?: any) {
    if (typeof keyOrValue !== 'symbol' && 'constructor' in keyOrValue) {
      this._dependencies.set(keyOrValue.constructor, keyOrValue);
      return;
    }
    if (typeof keyOrValue === 'symbol' || typeof keyOrValue === 'string') {
      this._dependencies.set(keyOrValue, value);
      return;
    }
    throw new Error('Invalid key');
  }

  resolveOptional<T>(
    key: InjectionKey<T> | Constructor<T>,
  ): T | undefined {
    return this._dependencies.get(key) ?? this._parent?.resolveOptional(key);
  }

  resolve<T>(key: InjectionKey<T> | Constructor<T>): T {
    const value = this.resolveOptional(key);
    if (value) {
      return value;
    }
    throw new Error(`Dependency not found: ${key}`);
  }
}
