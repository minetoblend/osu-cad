import { LifetimeEntryState } from "./LifetimeEntryState";
import { Action } from "../../bindables/Action";

export class LifetimeEntry
{
  #lifetimeStart = -Number.MAX_VALUE;

  #lifetimeEnd = Number.MAX_VALUE;

  public get lifetimeStart()
  {
    return this.#lifetimeStart;
  }

  public set lifetimeStart(value: number)
  {
    this.setLifetimeStart(value);
  }

  public get lifetimeEnd()
  {
    return this.#lifetimeEnd;
  }

  public set lifetimeEnd(value: number)
  {
    this.setLifetimeEnd(value);
  }

  public state: LifetimeEntryState = LifetimeEntryState.New;

  public childId: number = 0;

  public readonly requestLifetimeUpdate = new Action<LifetimeEntry>();

  public readonly lifetimeChanged = new Action<LifetimeEntry>();

  protected setLifetimeStart(start: number)
  {
    if (start !== this.#lifetimeStart)
    {
      this.setLifetime(start, this.#lifetimeEnd);
    }
  }

  protected setLifetimeEnd(end: number)
  {
    if (end !== this.#lifetimeEnd)
    {
      this.setLifetime(this.#lifetimeStart, end);
    }
  }

  protected setLifetime(start: number, end: number)
  {
    this.requestLifetimeUpdate.emit(this);
    this.#lifetimeStart = start;
    this.#lifetimeEnd = end;
    this.lifetimeChanged.emit(this);
  }
}
