import type { HitObject } from "./HitObject";

const symbolMetadata = Symbol.metadata ?? Symbol.for("Symbol.metadata");

export const invalidationsKey = Symbol("invalidations");

export type HitObjectInivalidationType = keyof OsucadMixins.HitObjectInvalidations;

export type HitObjectInvalidations<T extends HitObject> = {
  [key in keyof T]?: HitObjectInivalidationType[];
};

export function getInvalidations<T extends HitObject>(target: T): HitObjectInvalidations<T>
{
  return (target.constructor as any)[symbolMetadata]?.[invalidationsKey] ?? {};
}

export function invalidations<
  Class extends abstract new (...args: any[]) => HitObject,
>(invalidations: HitObjectInvalidations<InstanceType<Class>>)
{
  return (target: unknown, context: ClassDecoratorContext<Class>) =>
  {
    const entries = (context.metadata[invalidationsKey] = (context.metadata[
      invalidationsKey
    ] ?? {}) as HitObjectInvalidations<InstanceType<Class>>);

    for (const key in invalidations)
    {
      entries[key] = [
        ...new Set([...(entries[key] ?? []), ...(invalidations[key] ?? [])]),
      ];
    }
  };
}
