export interface IdGenerator
{
  next(): string
}

export class UUIDGenerator implements IdGenerator
{
  public next(): string
  {
    return crypto.randomUUID();
  }
}
