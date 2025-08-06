import type { BinaryWriter } from "../serialization";

export abstract class Delta
{
  protected constructor(readonly targetId: string)
  {
  }

  get mergeKey(): string | undefined
  {
    return undefined;
  }

  abstract encode(writer: BinaryWriter): void;

  tryMerge(other: Delta): boolean
  {
    return false;
  }
}
