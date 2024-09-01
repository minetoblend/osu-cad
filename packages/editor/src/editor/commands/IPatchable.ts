import type { PatchEncoder } from './patchEncoder/PatchEncoder';

export interface IPatchable<T extends object> {
  applyPatch: (patch: Partial<T>) => void;

  createPatchEncoder: () => PatchEncoder<any, T>;
}
