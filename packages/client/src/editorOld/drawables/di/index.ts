import { InjectionKey } from 'vue';

export * from './dependencyContainer.ts';
export * from './decorators';

export function injectionKey<T>(name?: string): InjectionKey<T> {
  return Symbol(name);
}
