export function assert(condition: boolean, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function nn<T>(value: T | null | undefined): T {
  assert(value !== null && value !== undefined);
  return value;
}