import type { IScrollAlgorithm } from './IScrollAlgorithm';

export class ConstantScrollAlgorithm implements IScrollAlgorithm {
  getDisplayStartTime(
    originTime: number,
    offset: number,
    timeRange: number,
    scrollLength: number,
  ): number {
    const adjustedTime = this.timeAt(-offset, originTime, timeRange, scrollLength);
    return adjustedTime - timeRange;
  }

  getLength(
    startTime: number,
    endTime: number,
    timeRange: number,
    scrollLength: number,
  ): number {
    return -this.positionAt(startTime, endTime, timeRange, scrollLength);
  }

  positionAt(
    time: number,
    currentTime: number,
    timeRange: number,
    scrollLength: number,
    originTime?: number,
  ): number {
    return ((time - currentTime) / timeRange * scrollLength);
  }

  timeAt(
    position: number,
    currentTime: number,
    timeRange: number,
    scrollLength: number,
  ): number {
    return position * timeRange / scrollLength + currentTime;
  }

  reset(): void {
  }
}
