import 'reflect-metadata';

const key = Symbol('DependencyLoader');
const injectKey = Symbol('Inject');

export function dependencyLoader(): MethodDecorator {
  return function (target: any, propertyKey: string | symbol) {
    const loaders = getDependencyLoaders(target);
    Reflect.defineMetadata(key, [...loaders, propertyKey], target);
  };
}

export function getDependencyLoaders(target: any): (string | symbol)[] {
  return Reflect.getMetadata(key, target) ?? [];
}

export function resolved(type: any, optional = false): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    const injections = getInjections(target);
    Reflect.defineMetadata(
      injectKey,
      [...injections, { key: propertyKey, type, optional }],
      target,
    );
  };
}

export function getInjections(target: any): {
  key: string | symbol;
  type: any;
  optional: boolean;
}[] {
  return Reflect.getMetadata(injectKey, target) ?? [];
}
