import 'reflect-metadata';

const metadataKey = Symbol('dependency-metadata');

export interface InjectionMetadata {
  inject: Injection[];
  provide: Injection[];
}

export interface Injection {
  key: unknown;
  propertyKey: string | symbol;
}

export function getInjectionMetadata(
  target: any,
  create: boolean = false,
): InjectionMetadata {
  if (!Reflect.hasOwnMetadata(metadataKey, target) && create) {
    const existing = Reflect.getMetadata(metadataKey, target) ?? {
      inject: [],
      provide: [],
    };

    Reflect.defineMetadata(
      metadataKey,
      {
        inject: [...existing.inject],
        provide: [...existing.provide],
      },
      target,
    );
  }
  return Reflect.getMetadata(metadataKey, target);
}

export function Inject(key: unknown): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    const metadata = getInjectionMetadata(target, true);
    metadata.inject.push({ key, propertyKey });
  };
}

export function Provide(key: unknown): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    const metadata = getInjectionMetadata(target, true);
    metadata.provide.push({ key, propertyKey });
  };
}
