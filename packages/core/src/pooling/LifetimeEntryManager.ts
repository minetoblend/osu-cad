import type { LifetimeEntry } from "./LifetimeEntry";
import { Action, List, SortedList } from "@osucad/framework";
import { LifetimeBoundaryCrossingDirection } from "./LifetimeBoundaryCrossingDirection";
import { LifetimeBoundaryKind } from "./LifetimeBoundaryKind";
import { LifetimeEntryState } from "./LifetimeEntryState";

export class LifetimeEntryManager 
{
  #newEntries = new List<LifetimeEntry>(0);

  #activeEntries = new List<LifetimeEntry>(0);

  get activeEntries() 
  {
    return this.#activeEntries;
  }

  #futureEntries = new SortedList({
    compare(a: LifetimeEntry, b: LifetimeEntry) 
    {
      return a.lifetimeStart - b.lifetimeStart;
    },
  });

  #pastEntries = new SortedList({
    compare(a: LifetimeEntry, b: LifetimeEntry) 
    {
      return a.lifetimeEnd - b.lifetimeEnd;
    },
  });

  #eventQueue: [LifetimeEntry, LifetimeBoundaryKind, LifetimeBoundaryCrossingDirection][] = [];

  #currentChildId = 0;

  readonly entryBecameAlive = new Action<LifetimeEntry>();

  readonly entryBecameDead = new Action<LifetimeEntry>();

  readonly entryCrossedBoundary = new Action<[LifetimeEntry, LifetimeBoundaryKind, LifetimeBoundaryCrossingDirection]>();

  addEntry(entry: LifetimeEntry) 
  {
    entry.requestLifetimeUpdate.addListener(this.#requestLifetimeUpdate);
    entry.childId = ++this.#currentChildId;
    entry.state = LifetimeEntryState.New;

    this.#newEntries.push(entry);
  }

  removeEntry(entry: LifetimeEntry) 
  {
    entry.requestLifetimeUpdate.removeListener(this.#requestLifetimeUpdate);

    let removed = false;
    switch (entry.state) 
    {
    case LifetimeEntryState.New:
      removed = this.#newEntries.remove(entry);
      break;

    case LifetimeEntryState.Current:
      removed = this.#activeEntries.remove(entry);

      if (removed)
        this.entryBecameDead.emit(entry);

      break;

    case LifetimeEntryState.Past:
      // Past entries may be found in the newEntries set after a lifetime change (see requestLifetimeUpdate).
      removed = this.#pastEntries.remove(entry) || this.#newEntries.remove(entry);
      break;

    case LifetimeEntryState.Future:
      // Future entries may be found in the newEntries set after a lifetime change (see requestLifetimeUpdate).
      removed = this.#futureEntries.remove(entry) || this.#newEntries.remove(entry);
      break;
    }

    if (!removed)
      return false;

    entry.childId = 0;
    return true;
  }

  clearEntries() 
  {
    for (const entry of this.#newEntries) 
    {
      entry.requestLifetimeUpdate.removeListener(this.#requestLifetimeUpdate);
      entry.childId = 0;
    }
    for (const entry of this.#activeEntries) 
    {
      entry.requestLifetimeUpdate.removeListener(this.#requestLifetimeUpdate);
      entry.childId = 0;
    }
    for (const entry of this.#futureEntries) 
    {
      entry.requestLifetimeUpdate.removeListener(this.#requestLifetimeUpdate);
      entry.childId = 0;
    }
    for (const entry of this.#pastEntries) 
    {
      entry.requestLifetimeUpdate.removeListener(this.#requestLifetimeUpdate);
      entry.childId = 0;
    }

    this.#newEntries.clear();
    this.#activeEntries.clear();
    this.#futureEntries.clear();
    this.#pastEntries.clear();
  }

  #requestLifetimeUpdate = (entry: LifetimeEntry) => 
  {
    const futureOrPastSet = this.#futureOrPastEntries(entry.state);

    if (futureOrPastSet?.remove(entry)) 
    {
      // Enqueue the entry to be processed in the next Update().
      this.#newEntries.push(entry);
    }
  };

  #futureOrPastEntries(state: LifetimeEntryState): SortedList<LifetimeEntry> | null 
  {
    switch (state) 
    {
    case LifetimeEntryState.Future:
      return this.#futureEntries;

    case LifetimeEntryState.Past:
      return this.#pastEntries;

    default:
      return null;
    }
  }

  update(startTime: number, endTime: number = startTime): boolean 
  {
    endTime = Math.max(endTime, startTime);

    let aliveEntriesChanged = false;

    for (const entry of this.#newEntries) 
    {
      if (this.#updateChildEntry(entry, startTime, endTime, true, true))
        aliveEntriesChanged = true;
    }
    this.#newEntries.clear();

    while (this.#futureEntries.length > 0) 
    {
      const entry = this.#futureEntries.first!;
      console.assert(entry.state === LifetimeEntryState.Future, `Expected entry to be in the future set, but was in state ${entry.state}.`);

      if (this.#getState(entry, startTime, endTime) === LifetimeEntryState.Future)
        break;

      this.#futureEntries.remove(entry);
      if (this.#updateChildEntry(entry, startTime, endTime, false, true))
        aliveEntriesChanged = true;
    }

    while (this.#pastEntries.length > 0) 
    {
      const entry = this.#pastEntries.last!;
      console.assert(entry.state === LifetimeEntryState.Past, `Expected entry to be in the past set, but was in state ${entry.state}.`);

      if (this.#getState(entry, startTime, endTime) === LifetimeEntryState.Past)
        break;

      this.#pastEntries.remove(entry);
      if (this.#updateChildEntry(entry, startTime, endTime, false, true))
        aliveEntriesChanged = true;
    }

    for (const entry of this.#activeEntries) 
    {
      if (this.#updateChildEntry(entry, startTime, endTime, false, false))
        aliveEntriesChanged = true;
    }

    this.#activeEntries.removeAll(e => e.state !== LifetimeEntryState.Current);

    while (this.#eventQueue.length !== 0) 
    {
      const entry = this.#eventQueue.shift()!;
      this.entryCrossedBoundary.emit(entry);
    }

    return aliveEntriesChanged;
  }

  #updateChildEntry(
    entry: LifetimeEntry,
    startTime: number,
    endTime: number,
    isNewEntry: boolean,
    mutateActiveEntries: boolean,
  ) 
  {
    const oldState = entry.state;

    const newState = this.#getState(entry, startTime, endTime);
    console.assert(newState !== LifetimeEntryState.New);

    if (newState === oldState) 
    {
      // If the state hasn't changed, then there's two possibilities:
      // 1. The entry was in the past/future sets and a lifetime change was requested. The entry needs to be added back to the past/future sets.
      // 2. The entry is and continues to remain active.
      if (isNewEntry)
        this.#futureOrPastEntries(newState)?.add(entry);
      else
        console.assert(newState === LifetimeEntryState.Current);

      // In both cases, the entry doesn't need to be processed further as it's already in the correct state.
      return false;
    }

    let aliveEntriesChanged = false;

    if (newState === LifetimeEntryState.Current) 
    {
      if (mutateActiveEntries)
        this.#activeEntries.push(entry);

      this.entryBecameAlive.emit(entry);
      aliveEntriesChanged = true;
    }
    else if (oldState === LifetimeEntryState.Current) 
    {
      if (mutateActiveEntries)
        this.#activeEntries.remove(entry);

      this.entryBecameDead.emit(entry);
      aliveEntriesChanged = true;
    }

    entry.state = newState;

    this.#futureOrPastEntries(newState)?.add(entry);
    this.#enqueueEvents(entry, oldState, newState);

    return aliveEntriesChanged;
  }

  #getState(entry: LifetimeEntry, startTime: number, endTime: number): LifetimeEntryState 
  {
    if (endTime < entry.lifetimeStart)
      return LifetimeEntryState.Future;

    if (startTime >= entry.lifetimeEnd)
      return LifetimeEntryState.Past;

    return LifetimeEntryState.Current;
  }

  #enqueueEvents(entry: LifetimeEntry, oldState: LifetimeEntryState, newState: LifetimeEntryState) 
  {
    switch (oldState) 
    {
    case LifetimeEntryState.Future:
      this.#eventQueue.push([entry, LifetimeBoundaryKind.Start, LifetimeBoundaryCrossingDirection.Forward]);
      if (newState === LifetimeEntryState.Past)
        this.#eventQueue.push([entry, LifetimeBoundaryKind.End, LifetimeBoundaryCrossingDirection.Forward]);
      break;

    case LifetimeEntryState.Current:
      this.#eventQueue.push(newState === LifetimeEntryState.Past
          ? [entry, LifetimeBoundaryKind.End, LifetimeBoundaryCrossingDirection.Forward]
          : [entry, LifetimeBoundaryKind.Start, LifetimeBoundaryCrossingDirection.Backward]);
      break;

    case LifetimeEntryState.Past:
      this.#eventQueue.push([entry, LifetimeBoundaryKind.End, LifetimeBoundaryCrossingDirection.Backward]);
      if (newState === LifetimeEntryState.Future)
        this.#eventQueue.push([entry, LifetimeBoundaryKind.Start, LifetimeBoundaryCrossingDirection.Backward]);
      break;
    }
  }
}
