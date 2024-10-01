import type { Transformable } from './Transformable';
import { SortedList } from '../../utils';
import { debugAssert } from '../../utils/debugAssert';
import { Transform } from './Transform';

export class TargetGroupingTransformTracker {
  constructor(
    readonly transformable: Transformable,
    readonly targetGrouping: string,
  ) {}

  readonly #transforms = new SortedList(Transform.COMPARER);

  get transforms(): readonly Transform[] {
    return this.#transforms.items;
  }

  #currentTransformID = 0;

  #lastAppliedTransformIndices: Record<string, number> = {};

  #targetMembers = new Set<string>();

  get targetMembers(): ReadonlySet<string> {
    return this.#targetMembers;
  }

  #appliedToEndReverts?: Set<string>;

  updateTransforms(time: number, rewinding: boolean) {
    if (rewinding && !this.transformable.removeCompletedTransforms) {
      this.#resetLastAppliedCache();

      this.#appliedToEndReverts?.clear();

      for (let i = this.#transforms.length - 1; i >= 0; i--) {
        const t = this.#transforms.get(i)!;

        // rewind logic needs to only run on transforms which have been applied at least once.
        if (!t.applied)
          continue;

        // some specific transforms can be marked as non-rewindable.
        if (!t.rewindable)
          continue;

        if (time >= t.startTime) {
          // we are in the middle of this transform, so we want to mark as not-completely-applied.
          // note that we should only do this for the last transform of each TargetMember to avoid incorrect application order.
          // the actual application will be in the main loop below now that AppliedToEnd is false.
          if (this.#appliedToEndReverts?.has(t.targetMember) !== true) {
            t.appliedToEnd = false;

            this.#appliedToEndReverts ??= new Set<string>();
            this.#appliedToEndReverts.add(t.targetMember);
          }
        }
        else {
          // we are before the start time of this transform, so we want to eagerly apply the value at current time and mark as not-yet-applied.
          // this transform will not be applied again unless we play forward in the future.
          t.apply(time);
          t.applied = false;
          t.appliedToEnd = false;
        }
      }
    }

    const transforms = this.#transforms.items;

    for (let i = this.#getLastAppliedIndex(); i < transforms.length; ++i) {
      let t = transforms[i]!;

      const tCanRewind = !this.transformable.removeCompletedTransforms && t.rewindable;

      let flushAppliedCache = false;

      if (time < t.startTime)
        break;

      if (!t.applied) {
        // This is the first time we are updating this transform.
        // We will find other still active transforms which act on the same target member and remove them.
        // Since following transforms acting on the same target member are immediately removed when a
        // new one is added, we can be sure that previous transforms were added before this one and can
        // be safely removed.
        for (let j = this.#getLastAppliedIndex(t.targetMember); j < i; ++j) {
          const u = transforms[j];
          if (u.targetMember !== t.targetMember)
            continue;

          if (!u.appliedToEnd)
            // we may have applied the existing transforms too far into the future.
            // we want to prepare to potentially read into the newly activated transform's StartTime,
            // so we should re-apply using its StartTime as a basis.
            u.apply(t.startTime);

          if (!tCanRewind) {
            this.#transforms.removeAt(j--);
            flushAppliedCache = true;
            i--;

            // if (u.AbortTargetSequence !== null)
            //   removalActions.Enqueue((u.AbortTargetSequence, s => s.TransformAborted()));
          }
          else {
            u.appliedToEnd = true;
          }
        }
      }

      if (!t.hasStartValue) {
        t.readIntoStartValue();
        t.hasStartValue = true;
      }

      if (!t.appliedToEnd) {
        t.apply(time);

        t.appliedToEnd = time >= t.endTime;

        if (t.appliedToEnd) {
          if (!tCanRewind) {
            this.#transforms.removeAt(i--);
            flushAppliedCache = true;
          }

          if (t.loopCount > 0)
            t.loopCount--;

          if (t.isLooping) {
            const oldLoopCount = t.loopCount;

            if (tCanRewind) {
              t.loopCount = 0;
              t = t.clone();
            }

            t.appliedToEnd = false;
            t.applied = false;
            t.hasStartValue = false;

            if (tCanRewind)
              t.loopCount = oldLoopCount;

            t.startTime += t.loopDelay;
            t.endTime += t.loopDelay;

            // this could be added back at a lower index than where we are currently iterating, but
            // running the same transform twice isn't a huge deal.
            this.#transforms.add(t);
            flushAppliedCache = true;
          }
          // else if (t.CompletionTargetSequence !== null)
          //   removalActions.Enqueue((t.CompletionTargetSequence, s => s.TransformCompleted()));
        }
      }

      if (flushAppliedCache)
        this.#resetLastAppliedCache();
      // if this transform is applied to end, we can be sure that all previous transforms have been completed.
      else if (t.appliedToEnd)
        this.#setLastAppliedIndex(t.targetMember, i + 1);
    }

    this.#invokePendingRemovalActions();
  }

  addTransform(transform: Transform, customTransformID?: number) {
    debugAssert(
      !(transform.transformID === 0 && this.#transforms.includes(transform)),
      'Zero-id Transforms should never be contained already.',
    );

    if (transform.targetGrouping !== this.targetGrouping) {
      throw new Error(
        `Target grouping "${transform.targetGrouping}" does not match this tracker's grouping "${this.targetGrouping}".`,
      );
    }

    this.#targetMembers.add(transform.targetMember);

    if (transform.transformID !== 0 && this.#transforms.includes(transform))
      throw new Error('Transformable may not contain the same Transform more than once.');

    transform.transformID = customTransformID ?? ++this.#currentTransformID;
    const insertionIndex = this.#transforms.add(transform);
    this.#resetLastAppliedCache();

    for (let i = insertionIndex + 1; i < this.#transforms.length; ++i) {
      const t = this.#transforms.get(i)!;

      if (t.targetMember === transform.targetMember) {
        this.#transforms.removeAt(i--);
        // if (t.AbortTargetSequence !== null) removalActions.Enqueue((t.AbortTargetSequence, (s) => s.TransformAborted()));
      }
    }

    this.#invokePendingRemovalActions();
  }

  removeTransform(toRemove: Transform) {
    this.#transforms.remove(toRemove);
    this.#resetLastAppliedCache();
  }

  clearTransformsAfter(time: number, targetMember?: string) {
    this.#resetLastAppliedCache();

    if (!targetMember) {
      for (let i = 0; i < this.#transforms.length; i++) {
        const t = this.#transforms.get(i)!;

        if (t.startTime >= time) {
          this.#transforms.removeAt(i--);
          // if (t.AbortTargetSequence !== null)
          //   removalActions.Enqueue((t.AbortTargetSequence, s => s.TransformAborted()));
        }
      }
    }
    else {
      for (let i = 0; i < this.#transforms.length; i++) {
        const t = this.#transforms.get(i)!;

        if (t.targetMember === targetMember && t.startTime >= time) {
          this.#transforms.removeAt(i--);
          // if (t.AbortTargetSequence !== null)
          //   removalActions.Enqueue((t.AbortTargetSequence, s => s.TransformAborted()));
        }
      }
    }

    this.#invokePendingRemovalActions();
  }

  finishTransforms(targetMember?: string) {
    let toFlushPredicate: (t: Transform) => boolean;
    if (targetMember === null)
      toFlushPredicate = t => !t.isLooping;
    else toFlushPredicate = t => !t.isLooping && (!targetMember || t.targetMember === targetMember);

    // Flush is undefined for endlessly looping transforms
    const toFlush = this.#transforms.filter(toFlushPredicate);

    this.#transforms.removeAll(t => toFlushPredicate(t));
    this.#resetLastAppliedCache();

    for (const t of toFlush) {
      if (!t.hasStartValue) {
        t.readIntoStartValue();
        t.hasStartValue = true;
      }

      t.apply(t.endTime);
      // t.TriggerComplete();
    }
  }

  #invokePendingRemovalActions() {
    // while (removalActions.TryDequeue(out var item))
    // item.action(item.sequence);
  }

  #getLastAppliedIndex(targetMember?: string) {
    if (!targetMember) {
      let min = Number.MAX_SAFE_INTEGER;

      for (const key in this.#lastAppliedTransformIndices) {
        const value = this.#lastAppliedTransformIndices[key];
        if (value < min)
          min = value;
      }

      return min;
    }

    return this.#lastAppliedTransformIndices[targetMember] ?? 0;
  }

  #setLastAppliedIndex(targetMember: string, index: number) {
    this.#lastAppliedTransformIndices[targetMember] = index;
  }

  #resetLastAppliedCache() {
    for (const tracked of this.#targetMembers) this.#lastAppliedTransformIndices[tracked]=0;
  }
}
