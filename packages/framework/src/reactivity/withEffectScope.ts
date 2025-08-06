import type { Drawable } from "../graphics";

export function withEffectScope<This extends Drawable, Value extends (this: This, ...args: any) => any>()
{
  return (target: Value,context: ClassMethodDecoratorContext<This, Value>): (this: This, ...args: any) => any =>
  {
    return function (...args)
    {
      this.effectScope.run(() => target.call(this, ...args));
    };
  };
}
