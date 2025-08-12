export interface IEncodedDelta
{
  type: string
  content: unknown
}

export abstract class Delta
{
  protected constructor(readonly type: string)
  {
  }

  abstract encode(): unknown;

  static encode(delta: Delta): IEncodedDelta
  {
    return {
      type: delta.type,
      content: delta.encode(),
    };
  }
}
