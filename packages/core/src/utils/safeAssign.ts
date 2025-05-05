export function safeAssign<T extends object, U>(
  target: T,
  source: U,
): T & U 
{
  for (const key in source) 
  {
    if (source[key] !== undefined)
      (target as any)[key] = source[key];
  }

  return target as T & U;
}
