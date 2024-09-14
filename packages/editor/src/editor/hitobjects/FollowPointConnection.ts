import type { DrawablePool } from 'osucad-framework';
import { EasingFunction, Vec2 } from 'osucad-framework';

import { PoolableDrawableWithLifetime } from '../../pooling/PoolableDrawableWithLifetime';
import { OsuHitObject } from '../../beatmap/hitObjects/OsuHitObject';
import type { FollowPointLifetimeEntry } from './FollowPointLifetimeEntry';
import type { FollowPoint } from './FollowPoint';

export class FollowPointConnection extends PoolableDrawableWithLifetime<FollowPointLifetimeEntry> {
  static readonly SPACING = 32;
  static readonly PREEMPT = 800;

  constructor() {
    super();
  }

  protected onApply(entry: FollowPointLifetimeEntry) {
    super.onApply(entry);

    entry.invalidated.addListener(this.#scheduleRefresh, this);

    this.#scheduleRefresh();
  }

  protected onFree(entry: FollowPointLifetimeEntry) {
    super.onFree(entry);

    entry.invalidated.removeListener(this.#scheduleRefresh);

    this.clearInternal(false);
  }

  pool: DrawablePool<FollowPoint> | null = null;

  #scheduleRefresh() {
    this.scheduler.addOnce(this.#refresh, this);
  }

  #refresh() {
    console.assert(this.pool !== null);

    const entry = this.entry;

    if (!entry?.end)
      return;

    const start = entry.start;
    const end = entry.end;

    const startTime = start.endTime;

    const startPosition = start.stackedEndPosition;
    const endPosition = end.stackedPosition;

    const distanceVector = endPosition.sub(startPosition);
    const distance = Math.floor(distanceVector.length());
    const rotation = distanceVector.angle();

    let finalTransformEndTime = startTime;

    let count = 0;

    for (let d = Math.floor(FollowPointConnection.SPACING * 1.5); d < distance - FollowPointConnection.SPACING; d += FollowPointConnection.SPACING) {
      const fraction = d / distance;

      const pointStartPosition = startPosition.add(distanceVector.scale(fraction - 0.1));
      const pointEndPosition = startPosition.add(distanceVector.scale(fraction));

      const { fadeInTime, fadeOutTime } = FollowPointConnection.getFadeTimes(start, end, d / distance);

      let fp: FollowPoint = this.internalChildren[count] as FollowPoint;

      if (!fp) {
        this.addInternal(fp = this.pool!.get());
      }

      fp.clearTransforms();

      fp.position = pointStartPosition;
      fp.rotation = rotation;
      fp.alpha = 0;
      fp.scale = new Vec2(1.5 * end.scale);

      {
        using _ = fp.beginAbsoluteSequence(fadeInTime);
        fp.fadeIn(end.timeFadeIn);

        fp.scaleTo(end.scale, end.timeFadeIn, EasingFunction.Out);
        fp.moveTo(pointStartPosition).moveTo(pointEndPosition, end.timeFadeIn, EasingFunction.Out);
        fp.delay(fadeOutTime - fadeInTime).fadeOut(end.timeFadeIn);
        fp.expire();

        finalTransformEndTime = fp.lifetimeEnd;
      }

      count++;
    }

    while (this.internalChildren.length > count) {
      this.removeInternal(this.internalChildren[this.internalChildren.length - 1], false);
    }


    entry.lifetimeEnd = finalTransformEndTime;
  }

  static getFadeTimes(
    start: OsuHitObject,
    end: OsuHitObject,
    fraction: number,
  ) {
    const startTime = start.endTime;
    const duration = end.startTime - startTime;

    // Preempt time can go below 800ms. Normally, this is achieved via the DT mod which uniformly speeds up all animations game wide regardless of AR.
    // This uniform speedup is hard to match 1:1, however we can at least make AR>10 (via mods) feel good by extending the upper linear preempt function (see: OsuHitObject).
    // Note that this doesn't exactly match the AR>10 visuals as they're classically known, but it feels good.
    const preempt = this.PREEMPT * Math.min(1, start.timePreempt / OsuHitObject.preempt_min);

    const fadeOutTime = startTime + fraction * duration;
    const fadeInTime = fadeOutTime - preempt;

    return { fadeInTime, fadeOutTime };
  }
}
