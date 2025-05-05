import type { IFrameBasedClock } from "../../timing";
import type { FrameTimeInfo } from "../../timing/FrameTimeInfo";
import type { List } from "../../utils";
import type { ITransformable } from "./ITransformable";
import type { Transform } from "./Transform";
import { type IUsable, ValueInvokeOnDisposal } from "../../types/IUsable";
import { almostEquals } from "../../utils";
import { AbsoluteSequenceSender } from "./AbsoluteSequenceSender";
import { TargetGroupingTransformTracker } from "./TargetGroupingTransformTracker";

export abstract class Transformable implements ITransformable
{
  abstract get clock(): IFrameBasedClock | null;

  get time(): FrameTimeInfo
  {
    return this.clock!.timeInfo;
  }

  get transformStartTime(): number
  {
    return (this.clock?.currentTime ?? 0) + this.transformDelay;
  }

  transformDelay = 0;

  get transforms(): Transform[]
  {
    return this.#targetGroupingTrackers?.flatMap(t => t.transforms) ?? [];
  }

  transformsForTargetMember(targetMember: string)
  {
    return this.#getTrackerFor(targetMember)?.transforms ?? [];
  }

  get latestTransformEndTime()
  {
    let max = this.transformStartTime;
    if (this.#targetGroupingTrackers !== null)
    {
      for (const tracker of this.#targetGroupingTrackers)
      {
        for (let i = 0; i < tracker.transforms.length; i++)
        {
          const transform = tracker.transforms[i];
          if (transform.endTime > max)
          {
            max = transform.endTime + 1;
          }
        }
      }
    }
    return max;
  }

  #removeCompletedTransforms = true;

  get removeCompletedTransforms(): boolean
  {
    return this.#removeCompletedTransforms;
  }

  set removeCompletedTransforms(value: boolean)
  {
    this.#removeCompletedTransforms = value;
  }

  protected updateTransforms()
  {
    this.transformDelay = 0;

    if (this.#targetGroupingTrackers === null)
      return;

    this.#updateTransforms(this.time.current);
  }

  #targetGroupingTrackers: TargetGroupingTransformTracker[] | null = null;

  #getTrackerFor(targetMember: string): TargetGroupingTransformTracker | null
  {
    if (this.#targetGroupingTrackers !== null)
    {
      for (const t of this.#targetGroupingTrackers)
      {
        if (t.targetMembers.has(targetMember))
          return t;
      }
    }

    return null;
  }

  #getTrackerForGrouping(targetGrouping: string, createIfNotExisting: boolean)
  {
    if (this.#targetGroupingTrackers !== null)
    {
      for (const t of this.#targetGroupingTrackers)
      {
        if (t.targetGrouping === targetGrouping)
          return t;
      }
    }

    if (!createIfNotExisting)
      return null;

    const tracker = new TargetGroupingTransformTracker(this, targetGrouping);

    this.#targetGroupingTrackers ??= [];
    this.#targetGroupingTrackers.push(tracker);

    return tracker;
  }

  #lastUpdateTransformsTime = -1;

  #updateTransforms(time: number, forceRewindReprocess = false)
  {
    if (this.#targetGroupingTrackers === null)
      return;

    const rewinding = this.#lastUpdateTransformsTime > time || forceRewindReprocess;
    this.#lastUpdateTransformsTime = time;

    for (let i = 0; i < this.#targetGroupingTrackers.length; i++)
      this.#targetGroupingTrackers[i].updateTransforms(time, rewinding);
  }

  removeTransform(toRemove: Transform): void
  {
    this.#getTrackerForGrouping(toRemove.targetGrouping, false)?.removeTransform(toRemove);

    // toRemove.triggerAbort()
  }

  clearTransforms(propagateChildren: boolean = false, targetMember?: string)
  {
    this.clearTransformsAfter(-Number.MAX_VALUE, propagateChildren, targetMember);
  }

  clearTransformsAfter(time: number, propagateChildren: boolean = false, targetMember?: string)
  {
    if (this.#targetGroupingTrackers === null)
      return;

    if (targetMember)
    {
      this.#getTrackerFor(targetMember)?.clearTransformsAfter(time, targetMember);
    }
    else
    {
      for (const tracker of this.#targetGroupingTrackers)
      {
        tracker.clearTransformsAfter(time, targetMember);
      }
    }
  }

  applyTransformsAt(time: number, propagateChildren: boolean = false)
  {
    if (this.removeCompletedTransforms)
    {
      throw new Error("Cannot arbitrarily apply transforms with removeCompletedTransforms active.");
    }

    this.#updateTransforms(time);
  }

  finishTransforms(propagateChildren: boolean = false, targetMember?: string)
  {
    if (this.#targetGroupingTrackers === null)
      return;

    if (targetMember)
    {
      this.#getTrackerFor(targetMember)?.finishTransforms(targetMember);
    }
    else
    {
      // Use for over foreach as collection may grow due to abort / completion events.
      // Note that this may mean that in the addition of elements being removed,
      // `FinishTransforms` may not be called on all items.
      for (let i = 0; i < this.#targetGroupingTrackers.length; i++)
      {
        this.#targetGroupingTrackers[i].finishTransforms();
      }
    }
  }

  addDelay(duration: number, propagateChildren: boolean = false)
  {
    this.transformDelay += duration;
  }

  beginDelayedSequence(delay: number, recursive: boolean = true): IUsable
  {
    if (delay === 0)
    {
      return new ValueInvokeOnDisposal(() =>
      {
      });
    }
    this.addDelay(delay, recursive);
    const newTransformDelay = this.transformDelay;

    return new ValueInvokeOnDisposal(() =>
    {
      if (!almostEquals(this.transformDelay, newTransformDelay))
      {
        throw new Error(
            "TransformDelay at the end of delayed sequence is not the same as at the beginning, but should be.",
        );
      }

      this.addDelay(-delay, recursive);
    });
  }

  beginAbsoluteSequence(newTransformStartTime: number, recursive: boolean = true): IUsable
  {
    return this.createAbsoluteSequenceAction(newTransformStartTime);
  }

  absoluteSequence(options: number | { time: number; recursive?: boolean }, block: () => void)
  {
    options = typeof options === "number" ? { time: options, recursive: true } : options;

    const sender = this.beginAbsoluteSequence(options.time, options.recursive);
    block();
    sender.dispose();
  }

  addTransform(transform: Transform, customTransformID?: number): void
  {
    if (transform.targetTransformable !== this)
    {
      throw new Error("Cannot add a transform to a Transformable that is not the target of the transform.");
    }

    if (this.clock === null)
    {
      if (!transform.hasStartValue)
      {
        transform.readIntoStartValue();
        transform.hasStartValue = true;
      }

      transform.apply(transform.endTime);
      transform.triggerComplete();

      return;
    }

    this.#getTrackerForGrouping(transform.targetGrouping, true)!.addTransform(transform, customTransformID);

    if (transform.startTime < this.time.current || transform.endTime <= this.time.current)
    {
      this.#updateTransforms(
          this.time.current,
          !this.removeCompletedTransforms && transform.startTime <= this.time.current,
      );
    }
  }

  protected createAbsoluteSequenceAction(newTransformStartTime: number): AbsoluteSequenceSender
  {
    const oldTransformDelay = this.transformDelay;
    const newTransformDelay = (this.transformDelay = newTransformStartTime - (this.clock?.currentTime ?? 0));

    return new AbsoluteSequenceSender(this, oldTransformDelay, newTransformDelay);
  }

  collectAbsoluteSequenceActionsFromSubTree(newTransformStartTime: number, actions: List<AbsoluteSequenceSender>)
  {
    actions.push(this.createAbsoluteSequenceAction(newTransformStartTime));
  }
}
