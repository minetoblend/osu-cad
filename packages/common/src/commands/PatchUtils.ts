export class PatchUtils {
  static createUndoPatch<T extends object>(
    patch: Partial<T>,
    entity: T,
  ): Partial<T> {
    const undoPatch = {} as Partial<T>;

    for (const key in patch) {
      const patchValue = patch[key];
      const originalValue = entity[key];

      console.assert(originalValue !== undefined);

      if (patchValue !== originalValue)
        undoPatch[key] = originalValue;
    }

    return undoPatch;
  }

  static createUndoPatchNullable<T extends object>(
    patch: Partial<T> | null,
    entity: T | null,
  ): Partial<T> | null | undefined {
    if (patch === null && entity === null)
      return undefined;

    if (patch === null || entity === null)
      return entity;

    const undoPatch = {} as Partial<T>;

    for (const key in patch) {
      const patchValue = patch[key];
      const originalValue = entity[key];

      console.assert(originalValue !== undefined);

      if (patchValue !== originalValue)
        undoPatch[key] = originalValue;
    }

    return undoPatch;
  }

  static applyPatch<T extends object>(patch: Partial<T>, entity: T) {
    for (const key in patch) {
      const value = patch[key];
      if (value !== undefined)
        entity[key] = value;
    }
  }
}
