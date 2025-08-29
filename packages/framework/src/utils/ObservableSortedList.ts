import { Action } from "../bindables";
import { SortedList } from "./SortedList";

export class ObservableSortedList<T> extends SortedList<T>
{
  public readonly added = new Action<[T]>();

  public readonly removed = new Action<[T]>();

  public readonly sorted = new Action();

  public override set(index: number, item: T)
  {
    const oldValue = this.get(index);
    if (item !== oldValue)
    {
      if (oldValue)
      {
        this.onRemoved(oldValue);
      }

      this.onAdded(item);
    }

    super.set(index, item);
  }

  public override add(item: T): number
  {
    const result = super.add(item);
    this.onAdded(item);
    return result;
  }

  public override remove(item: T): boolean
  {
    if (super.remove(item))
    {
      this.onRemoved(item);
    }

    return false;
  }

  public override removeAt(index: number)
  {
    const item = this.get(index);

    super.removeAt(index);

    if (item)
    {
      this.onRemoved(item);
    }
  }

  public override removeAll(match: (item: T) => boolean)
  {
    const toRemove = new Set<T>();

    for (const item of this.items)
    {
      if (match(item))
      {
        toRemove.add(item);
      }
    }

    super.removeAll(it => toRemove.has(it));

    for (const item of toRemove)
    {
      this.onRemoved(item);
    }
  }

  public override clear()
  {
    const items = [...this.items];

    super.clear();

    for (const item of items)
    {
      this.onRemoved(item);
    }
  }

  protected onAdded(item: T)
  {
    this.added.emit(item);
  }

  protected onRemoved(item: T)
  {
    this.removed.emit(item);
  }

  public override sort()
  {
    super.sort();
    this.sorted.emit();
  }
}
