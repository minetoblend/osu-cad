import { Bindable, Comparer } from "@osucad/framework";
import { ObjectDDS, type } from "@osucad/multiplayer-core";
import { bindableBacked } from "../../utils";

export abstract class ControlPoint extends ObjectDDS
{
  public static readonly COMPARER = new class extends Comparer<ControlPoint>
  {
    public compare(a: ControlPoint, b: ControlPoint)
    {
      const result = a.time - b.time;
      if (result !== 0)
        return result;

      return a.uid - b.uid;
    }
  }();

  public uid = 0;

  public readonly timeBindable = new Bindable(0);

  @type("float64")
  @bindableBacked("timeBindable")
  public accessor time!: number;

  public isRedundant(other: ControlPoint): boolean
  {
    return false;
  }
}
