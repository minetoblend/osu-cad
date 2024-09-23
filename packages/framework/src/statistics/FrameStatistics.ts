import { StatisticsCounterType } from './StatisticsCounterType.ts';

export class FrameStatistics {
  private static COUNTERS = new Array<number>(StatisticsCounterType.Length);

  static clear() {
    this.COUNTERS.fill(0);
  }

  static increment(counterType: StatisticsCounterType) {
    this.COUNTERS[counterType]++;
  }

  static add(counterType: StatisticsCounterType, value: number) {
    this.COUNTERS[counterType] += value;
  }

  static get counters() {
    return this.COUNTERS as Readonly<number[]>;
  }

  static drawTime = 0;

  static inputQueue = 0;

  static frameTime = 0;
}
