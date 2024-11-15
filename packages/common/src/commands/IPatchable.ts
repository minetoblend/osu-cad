export interface IPatchable<T extends object> {
  applyPatch: (patch: Partial<T>) => void;
}
