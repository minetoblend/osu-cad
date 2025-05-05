import type { Drawable } from "../graphics";

export function withEffectScope(): MethodDecorator
{
  return (target, propertyKey, descriptor) =>
  {
    const method = descriptor.value! as (...args: any[]) => any;

    descriptor.value = function(this: Drawable, ...args: any[])
    {
      return this.effectScope.run(() =>
      {
        method.call(this, ...args);
      });
    } as any;
  };
}
