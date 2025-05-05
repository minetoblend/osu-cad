export function nn<T>(value: T | null | undefined, message?: string): T 
{
  if (value === null || value === undefined)
    throw new Error(message ?? `Unexpected ${value} value`);

  return value;
}
