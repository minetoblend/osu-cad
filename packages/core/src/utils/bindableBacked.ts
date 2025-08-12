import type { Bindable } from "@osucad/framework";

export function bindableBacked<This, Value>(key: keyof This)
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
