export function debugAssert(condition: boolean, message?: string): void {
  if (!condition && import.meta.env.DEV) {
    throw new Error(message);
  }
}
