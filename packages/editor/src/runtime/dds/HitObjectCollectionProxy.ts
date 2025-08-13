import type { HitObjectCollection } from "./HitObjectCollection";

const IS_PROXY = Symbol();

export function createHitObjectCollectionProxy(target: HitObjectCollection): HitObjectCollection
{
  return new Proxy(target, {
    get(target: HitObjectCollection, p: string | symbol, receiver: any): any
    {
      if (p === IS_PROXY)
        return true;

      if (typeof p === "string")
      {
        const index = Number.parseInt(p);
        if (Number.isFinite(index))
          return target.hitObjects[index];
      }

      return Reflect.get(target, p, target);
    },
  });
}
