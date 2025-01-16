import type { SortedList } from '@osucad/framework';
import type { IScrollAlgorithm } from './IScrollAlgorithm';
import { MultiplierControlPoint } from '../../../timing/MultiplierControlPoint';

export class OverlappingScrollAlgorithm implements IScrollAlgorithm {
  constructor(
    readonly controlPoints: SortedList<MultiplierControlPoint>,
  ) {
  }

  getDisplayStartTime(originTime: number, offset: number, timeRange: number, scrollLength: number): number {
    const controlPoint = this.#controlPointAt(originTime + offset);

    const visibleDuration = (scrollLength + offset) * timeRange / controlPoint.multiplier / scrollLength;
    return originTime - visibleDuration;
  }

  getLength(startTime: number, endTime: number, timeRange: number, scrollLength: number): number {
    return -this.positionAt(startTime, endTime, timeRange, scrollLength);
  }

  positionAt(time: number, currentTime: number, timeRange: number, scrollLength: number, originTime?: number): number {
    return ((time - currentTime) / timeRange * this.#controlPointAt(originTime ?? time).multiplier * scrollLength);
  }

  timeAt(position: number, currentTime: number, timeRange: number, scrollLength: number): number {
    console.assert(this.controlPoints.length > 0);

    // Iterate over control points and find the most relevant for the provided position.
    // Note: Due to velocity adjustments, overlapping control points will provide multiple valid time values for a single position
    // As such, this operation provides unexpected results by using the latter of the control points.
    const relevantControlPoint = this.controlPoints.findLast(cp => this.positionAt(cp.time, currentTime, timeRange, scrollLength) <= position) ?? this.controlPoints.first!;

    const positionAtControlPoint = this.positionAt(relevantControlPoint.time, currentTime, timeRange, scrollLength);

    return relevantControlPoint.time + (position - positionAtControlPoint) * timeRange / relevantControlPoint.multiplier / scrollLength;
  }

  reset(): void {
  }

  #controlPointAt(time: number) {
    let index = this.controlPoints.binarySearch({ time } as any);

    if (index < 0)
      index = ~index - 1;

    return this.controlPoints.get(index) ?? this.controlPoints.first ?? new MultiplierControlPoint(Number.NEGATIVE_INFINITY);
  }
}
