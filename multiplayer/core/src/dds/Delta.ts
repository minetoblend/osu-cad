export interface IEncodedDelta
{
  type: string
  content: unknown
}

export abstract class Delta<out T = unknown>
{
  abstract encode(): T;
}
