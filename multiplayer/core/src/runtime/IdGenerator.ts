import type { DDS } from "../dds/index.js";

export interface IdGenerator
{
  next(dds: DDS): string
}

export class UUIDGenerator implements IdGenerator
{
  next(dds: DDS): string
  {
    return crypto.randomUUID();
  }
}

export class SequenceIdGenerator implements IdGenerator
{
  constructor(offset: number = 0)
  {
    this.#current = offset;
  }

  #current: number;

  next(dds: DDS): string
  {
    return `${this.#current++}`;
  }
}

export class PrefixedIdGenerator implements IdGenerator
{
  constructor(public prefix: string)
  {
  }

  #current = 0;

  next(dds: DDS): string
  {
    return `${this.prefix}${this.#current++}`;
  }
}
