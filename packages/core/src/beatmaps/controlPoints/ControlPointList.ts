import { ObservableSortedList } from "@osucad/framework";
import { ControlPoint } from "./ControlPoint";

export class ControlPointList<T extends ControlPoint> extends ObservableSortedList<T>
{
  public constructor()
  {
    super(ControlPoint.COMPARER);
  }

  protected override onAdded(item: T)
  {
    super.onAdded(item);

    item.timeBindable.valueChanged.addListener(this.sort, this);
  }

  protected override onRemoved(item: T)
  {
    super.onRemoved(item);

    item.timeBindable.valueChanged.removeListener(this.sort, this);
  }

  public controlPointIndexAt(time: number)
  {
    if (this.length === 0)
      return -1;

    let index = this.binarySearch({ time } as unknown as T);

    if (index >= 0)
      return index;

    index = ~index;

    if (index > 0)
      index--;

    return index;
  }

  public controlPointAt(time: number): T | undefined
  {
    const index = this.controlPointIndexAt(time);

    if (index < 0)
      return undefined;

    const controlPoint = this.get(index);

    return controlPoint;
  }
}
