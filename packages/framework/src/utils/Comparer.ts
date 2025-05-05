import type { IComparer } from "./IComparer";

export abstract class Comparer<T> implements IComparer<T> 
{
  abstract compare(a: T, b: T): number;

  equals(a: T, b: T) 
  {
    return this.compare(a, b) === 0;
  }
}
