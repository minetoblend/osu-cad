export abstract class Delta<out T = unknown>
{
  public abstract encode(): T;
}

export abstract class MergeableDelta<out T = unknown> extends Delta<T>
{
  public abstract tryAppend(other: MergeableDelta): boolean;
}
