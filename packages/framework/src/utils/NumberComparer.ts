import { Comparer } from "./Comparer";

export class NumberComparer extends Comparer<number>
{
  static readonly Instance = new NumberComparer();

  override compare(a: number, b: number): number
  {
    if (a === b)
      return 0;

    return a > b ? 1 : -1;
  }
}
