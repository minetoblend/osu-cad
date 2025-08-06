import type { CompositeDrawable, Drawable } from "../graphics";
import type { InjectionToken } from "./DependencyContainer";

export interface InjectionMetadata
{
  type: any
  optional: boolean
  set(value: unknown): void
}

export interface ProviderMetadata
{
  type?: unknown
  get(this: CompositeDrawable): unknown
}

export const metadataKey = Symbol.metadata ?? Symbol.for("Symbol.metadata");
export const injectionsKey = Symbol("injections");
export const providersKey = Symbol("providers");
export const dependencyLoadersKey = Symbol("dependencyLoaders");
export const asyncDependencyLoadersKey = Symbol("asyncDependencyLoaders");



export function resolved<This extends Drawable, Value>(type: { prototype: Value }, optional?: false): (target: ClassAccessorDecoratorTarget<This, Value>, context: ClassAccessorDecoratorContext<This,Value>) => void;
export function resolved<This extends Drawable, Value>(type: { prototype: Value }, optional: true): (target: ClassAccessorDecoratorTarget<This, Value | undefined>, context: ClassAccessorDecoratorContext<This,Value | undefined>) => void;
export function resolved<This extends Drawable, Value>(type: InjectionToken<Value>, optional?: false): (target: ClassAccessorDecoratorTarget<This, Value>, context: ClassAccessorDecoratorContext<This,Value>) => void;
export function resolved<This extends Drawable, Value>(type: InjectionToken<Value>, optional: true): (target: ClassAccessorDecoratorTarget<This, Value | undefined>, context: ClassAccessorDecoratorContext<This,Value | undefined>) => void;

export function resolved<This extends Drawable, Value>(type: any, optional = false)
{
  return ({ set }: ClassAccessorDecoratorTarget<This, Value>, context: ClassAccessorDecoratorContext<This, Value>) =>
  {
    context.addInitializer(function()
    {
      this[injectionsKey].push({
        type,
        optional,
        set: (value: unknown) => set.call(this, value as Value),
      });
    });
  };
}

export function dependencyLoader<This extends Drawable, Value extends (this: This) => void>()
{
  return (target: Value, context: ClassMethodDecoratorContext<This, Value>) =>
  {
    context.addInitializer(function()
    {
      this[dependencyLoadersKey].push(() => target.call(this));
    });
  };
}


export function asyncDependencyLoader<This extends Drawable, Value extends (this: This) => Promise<void>>()
{
  return (target: Value, context: ClassMethodDecoratorContext<This, Value>) =>
  {
    context.addInitializer(function()
    {
      this[asyncDependencyLoadersKey].push(() => target.call(this));
    });
  };
}

export function provide<This extends CompositeDrawable, Value>(type?: any)
{
  return (
    target: unknown,
    context: ClassFieldDecoratorContext<This, Value> | ClassGetterDecoratorContext<This, Value> | ClassAccessorDecoratorContext<This, Value>,
  ) =>
  {
    context.addInitializer(function()
    {
      (this as CompositeDrawable)[providersKey].push({
        type,
        get: () => context.access.get(this),
      });
    });
  };
}

export function provideSelf<This extends CompositeDrawable, Class extends abstract new (...args: any) => This>(type?: any)
{
  return (
    target: unknown,
    context: ClassDecoratorContext<Class>,
  ) =>
  {
    const providers = (context.metadata[providersKey] ?? []) as ProviderMetadata[];

    providers.push({
      type: type ?? target,
      get(): unknown
      {
        return this;
      },
    });

    context.metadata[providersKey] = providers;
  };
}
