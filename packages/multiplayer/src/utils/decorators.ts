export function limit<This>(options: { min?: number, max?: number })
{
  return (
    target: ClassAccessorDecoratorTarget<This, number>,
    context: ClassAccessorDecoratorContext<This, number>,
  ): ClassAccessorDecoratorResult<This, number> =>
  {
    return {
      set(value)
      {
        if (options.max !== undefined && value > options.max)
          value = options.max;

        if (options.min !== undefined && value < options.min)
          value = options.min;

        target.set.call(this, value);
      },
    };
  };
}
