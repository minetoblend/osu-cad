import type { Bindable } from "@osucad/framework";

type KeysMatching<T extends object, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never
}[keyof T];

export function bindableBacked<This extends object, Value>(key: KeysMatching<This, Bindable<Value>>)
{
  return (
    target: ClassAccessorDecoratorTarget<This, Value>,
    context: ClassAccessorDecoratorContext<This, Value>,
  ): ClassAccessorDecoratorResult<This, Value> =>
  {
    return {
      get()
      {
        return (this[key] as Bindable<Value>).value;
      },
      set(value)
      {
        (this[key] as Bindable<Value>).value = value;
      },
    };
  };
}
