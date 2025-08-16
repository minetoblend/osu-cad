export function assert<Condition>(condition: Condition, message: string | number): Condition extends true ? never : void;

export function assert(condition: boolean, message: string | number)
{
  if (!condition)
  {
    fail(message);
  }
}

export function fail(message: string | number): never
{
  throw new Error(`Assertion failed: ${typeof message === "number" ? "0x" + message.toString(16) : message}`);
}
