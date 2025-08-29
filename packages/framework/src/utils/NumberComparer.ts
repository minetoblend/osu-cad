import { Comparer } from "./Comparer";

export class NumberComparer extends Comparer<number>
{
  public static readonly Instance = new NumberComparer();

  public override compare(a: number, b: number): number
  {
    if (a === b)
      return 0;

    return a > b ? 1 : -1;
  }
}
