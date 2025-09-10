import type { IClock } from "./IClock";

export interface ISourceChangeableClock
{
  readonly source?: IClock

  changeSource(source: IClock): void
}
