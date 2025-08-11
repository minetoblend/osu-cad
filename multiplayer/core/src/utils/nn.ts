export function nn<T>(value: T | null | undefined): T
{
  if (value === null || value === undefined)
    throw new Error(`Unexpected ${value} value`);

  return value;
}
