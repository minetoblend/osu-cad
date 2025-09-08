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

export class CountingIdGenerator implements IdGenerator
{
  private count = 0;

  public next(): string
  {
    return (++this.count).toString(36);
  }
}
