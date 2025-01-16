import type { IComparer, SortedList } from '@osucad/framework';
import type { MultiplierControlPoint } from '../../../timing/MultiplierControlPoint';
import type { IScrollAlgorithm } from './IScrollAlgorithm';
import { binarySearch } from '../../../../utils/binarySearch';

export class SequentialScrollAlgorithm implements IScrollAlgorithm {
  static readonly by_position_comparer: IComparer<PositionMapping> = {
    compare(a: PositionMapping, b: PositionMapping) {
      return a.position - b.position;
    },
  };

  readonly #controlPoints: SortedList<MultiplierControlPoint>;

  readonly #positionMappings: PositionMapping[] = [];

  constructor(controlPoints: SortedList<MultiplierControlPoint>) {
    this.#controlPoints = controlPoints;
  }

  getDisplayStartTime(originTime: number, offset: number, timeRange: number, scrollLength: number): number {
    return this.timeAt(-(scrollLength + offset), originTime, timeRange, scrollLength);
  }

  getLength(startTime: number, endTime: number, timeRange: number, scrollLength: number): number {
    const objectLength = this.#relativePositionAt(endTime, timeRange) - this.#relativePositionAt(startTime, timeRange);
    return objectLength * scrollLength;
  }

  positionAt(time: number, currentTime: number, timeRange: number, scrollLength: number, originTime?: number): number {
    const timelineLength = this.#relativePositionAt(time, timeRange) - this.#relativePositionAt(currentTime, timeRange);
    return timelineLength * scrollLength;
  }

  timeAt(position: number, currentTime: number, timeRange: number, scrollLength: number): number {
    if (this.#controlPoints.length === 0)
      return position * timeRange;

    // Find the position at the current time, and the given length.
    const relativePosition = this.#relativePositionAt(currentTime, timeRange) + position / scrollLength;

    const positionMapping = this.#findControlPointMapping(timeRange, new PositionMapping(0, null, relativePosition), it => it.position);

    // Begin at the control point's time and add the remaining time to reach the given position.
    return positionMapping.time + (relativePosition - positionMapping.position) * timeRange / positionMapping.controlPoint!.multiplier;
  }

  reset() {
    this.#positionMappings.length = 0;
  }

  #relativePositionAt(time: number, timeRange: number) {
    if (this.#controlPoints.length === 0)
      return time / timeRange;

    const mapping = this.#findControlPointMapping(timeRange, new PositionMapping(time));

    // Begin at the control point's position and add the remaining distance to reach the given time.
    return mapping.position + (time - mapping.time) / timeRange * mapping.controlPoint!.multiplier;
  }

  #findControlPointMapping(timeRange: number, search: PositionMapping, compareBy: (mapping: PositionMapping) => number = it => it.time) {
    this.#generatePositionMappings(timeRange);

    let { found, index: mappingIndex } = binarySearch(compareBy(search), this.#positionMappings, compareBy);

    if (!found && mappingIndex > 0) {
      // If the search value isn't found, the _next_ control point is returned, but we actually want the _previous_ control point.
      // In doing so, we must make sure to not underflow the position mapping list (i.e. always use the 0th control point for time < first_control_point_time).
      mappingIndex--;

      console.assert(mappingIndex < this.#positionMappings.length);
    }

    const mapping = this.#positionMappings[mappingIndex];
    console.assert(!!mapping.controlPoint);

    return mapping;
  }

  #generatePositionMappings(timeRange: number) {
    if (this.#positionMappings.length > 0)
      return;

    if (this.#controlPoints.length === 0)
      return;

    this.#positionMappings.push(new PositionMapping(this.#controlPoints.first!.time, this.#controlPoints.first!));

    for (let i = 0; i < this.#controlPoints.length - 1; i++) {
      const current = this.#controlPoints.get(i)!;
      const next = this.#controlPoints.get(i + 1)!;

      // Figure out how much of the time range the duration represents, and adjust it by the speed multiplier
      const length = ((next.time - current.time) / timeRange * current?.multiplier);

      this.#positionMappings.push(new PositionMapping(next.time, next, this.#positionMappings[this.#positionMappings.length - 1].position + length));
    }
  }
}

class PositionMapping {
  constructor(
    readonly time: number,
    readonly controlPoint: MultiplierControlPoint | null = null,
    readonly position: number = 0,
  ) {
  }
}
