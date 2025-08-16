export abstract class Delta<out T = unknown>
{
  abstract encode(): T;
}

export abstract class MergeableDelta<out T = unknown> extends Delta<T>
{
  abstract tryAppend(other: MergeableDelta): boolean;
}
