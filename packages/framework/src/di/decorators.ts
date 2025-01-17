import 'reflect-metadata';

const key = Symbol('DependencyLoader');
const asyncKey = Symbol('AsyncDependencyLoader');
const injectKey = Symbol('Inject');
const provideKey = Symbol('Provide');

export function dependencyLoader(): MethodDecorator {
  return function (target: any, propertyKey: string | symbol) {
    const loaders = getDependencyLoaders(target);

    Reflect.defineMetadata(key, [...loaders, propertyKey], target);
  };
}

export function asyncDependencyLoader(): MethodDecorator {
  return function (target: any, propertyKey: string | symbol) {
    const loaders = getAsyncDependencyLoaders(target);
    Reflect.defineMetadata(asyncKey, [...loaders, propertyKey], target);
  };
}
export function getDependencyLoaders(target: any): string[] {
  return Reflect.getMetadata(key, target) ?? [];
}

export function getAsyncDependencyLoaders(target: any): (string | symbol)[] {
  return Reflect.getMetadata(asyncKey, target) ?? [];
}

export function resolved(type: any, optional = false): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol, parameterIndex?: number) {
    const injections = getInjections(target);

    Reflect.defineMetadata(injectKey, [...injections, { key: propertyKey, type, optional }], target);
  };
}

export function provide(type?: any, optional = false): PropertyDecorator & ClassDecorator {
  return function (target: any, propertyKey?: string | symbol) {
    if (!propertyKey)
      target = target.prototype;

    const providers = getProviders(target);
    Reflect.defineMetadata(provideKey, [...providers, { key: propertyKey, type, optional }], target);
  };
}

export function getInjections(target: any): {
  key: string | symbol;
  type: any;
  optional: boolean;
}[] {
  return Reflect.getMetadata(injectKey, target) ?? [];
}

export function getProviders(target: any): {
  key?: string | symbol;
  type?: any;
}[] {
  return Reflect.getMetadata(provideKey, target) ?? [];
}
