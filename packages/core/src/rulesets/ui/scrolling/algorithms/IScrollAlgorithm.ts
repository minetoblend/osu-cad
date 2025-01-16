export interface IScrollAlgorithm {
  getDisplayStartTime(
    originTime: number,
    offset: number,
    timeRange: number,
    scrollLength: number,
  ): number;

  getLength(
    startTime: number,
    endTime: number,
    timeRange: number,
    scrollLength: number,
  ): number;

  positionAt(
    time: number,
    currentTime: number,
    timeRange: number,
    scrollLength: number,
    originTime?: number,
  ): number;

  timeAt(
    position: number,
    currentTime: number,
    timeRange: number,
    scrollLength: number,
  ): number;

  reset(): void;
}
