import type { IComparer } from "./IComparer";

export abstract class Comparer<T> implements IComparer<T>
{
  public abstract compare(a: T, b: T): number;

  public equals(a: T, b: T)
  {
    return this.compare(a, b) === 0;
  }
}
