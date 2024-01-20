import {Constructor} from "@osucad/common";
import {InjectionKey} from "vue";

export class DependencyContainer {
  private dependencies = new Map<unknown, unknown>();

  constructor(private readonly parent?: DependencyContainer) {
  }

  provide(key: unknown, value: unknown) {
    this.dependencies.set(key, value);
  }

  inject<T>(key: Constructor<T>, optional?: false): T;
  inject<T>(key: Constructor<T>, optional: boolean): T | undefined;
  inject<T>(key: InjectionKey<T>, optional?: false): T;
  inject<T>(key: InjectionKey<T>, optional: boolean): T | undefined;
  inject<T>(key: unknown, optional?: false): T;
  inject<T>(key: unknown, optional: boolean): T | undefined;
  inject(key: unknown, optional = false): any {
    const value = this.dependencies.get(key);
    if (value !== undefined) return value;

    if (this.parent)
      return this.parent.inject(key);

    if (optional)
      return undefined;
    throw new Error(`No dependency found for key ${(key as any)?.toString?.() ?? key}`);
  }

}

