import type { IBeatmap } from '../../beatmap/IBeatmap';
import type { IBarLine } from './IBarLine';
import { almostBigger, almostEquals } from 'osucad-framework';

export class BarLineGenerator<TBarLine extends IBarLine> {
  barLines: TBarLine[] = [];

  constructor(readonly beatmap: IBeatmap<any>, createBarLine: (startTime: number, major: boolean) => TBarLine) {
    if (beatmap.hitObjects.length === 0)
      return;

    const firstHitTime = beatmap.hitObjects.first!.startTime;
    const lastHitTime = 1 + beatmap.hitObjects.last!.endTime;

    const timingPoints = beatmap.controlPoints.timingPoints;

    if (timingPoints.length === 0)
      return;

    for (let i = 0; i < timingPoints.length; i++) {
      const currentTimingPoint = timingPoints.get(i)!;
      let currentBeat = 0;

      const generationStartTime = Math.min(0, firstHitTime);

      const endTime = i < timingPoints.length - 1 ? timingPoints.get(i + 1)!.time : lastHitTime + currentTimingPoint.beatLength * currentTimingPoint.meter;

      const barLength = currentTimingPoint.beatLength * currentTimingPoint.meter;

      let startTime;

      if (currentTimingPoint.time > generationStartTime) {
        startTime = currentTimingPoint.time;
      }
      else {
        // If the timing point starts before the minimum allowable time for bar lines,
        // we still need to compute a start time for generation that is actually properly aligned with the timing point.
        const barCount = Math.ceil((generationStartTime - currentTimingPoint.time) / barLength);

        startTime = currentTimingPoint.time + barCount * barLength;
      }

      if (currentTimingPoint.omitFirstBarLine)
        startTime += barLength;

      for (let t = startTime; almostBigger(endTime, t); t += barLength, currentBeat++) {
        const roundedTime = Math.sign(t) * Math.round(Math.abs(t));

        // in the case of some bar lengths, rounding errors can cause t to be slightly less than
        // the expected whole number value due to floating point inaccuracies.
        // if this is the case, apply rounding.
        if (almostEquals(t, roundedTime)) {
          t = roundedTime;
        }

        this.barLines.push(createBarLine(t, currentBeat % currentTimingPoint.meter === 0));
      }
    }
  }
}
