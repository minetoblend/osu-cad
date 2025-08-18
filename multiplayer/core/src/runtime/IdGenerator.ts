export interface IdGenerator
{
  next(): string
}

export class UUIDGenerator implements IdGenerator
{
  next(): string
  {
    return crypto.randomUUID();
  }
}
