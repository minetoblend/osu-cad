import type { Drawable } from "../graphics";
import type { IUnbindable } from "./IUnbindable";

export namespace UnbindActionCache
{
  export type UnbindAction = (drawable: Drawable) => void;

  const cache = new Map<Drawable["constructor"], UnbindAction>();

  export function getUnbindAction(drawable: Drawable): UnbindAction
  {
    const cached = cache.get(drawable.constructor);
    if (cached)
      return cached;

    const descriptors = Object.getOwnPropertyDescriptors(drawable);

    const keys: string[] = [];

    for (const key in descriptors)
    {
      const descriptor = descriptors[key];

      const value = descriptor.value;
      if (value && typeof value === "object" && "unbindAll" in value && typeof value.unbindAll === "function")
      {
        keys.push(key);
      }
    }

    const unbindAction = createUnbindAction(keys);

    cache.set(drawable.constructor, unbindAction);

    return unbindAction;
  }

  function createUnbindAction(keys: string[]): UnbindAction
  {
    return (drawable: Drawable) =>
    {
      for (const key of keys)
      {
        const value = drawable[key as keyof Drawable] as unknown as IUnbindable;

        value.unbindAll();
      }
    };
  }
}
