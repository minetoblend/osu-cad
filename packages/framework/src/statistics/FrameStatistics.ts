import { StatisticsCounterType } from './StatisticsCounterType';
import { Timer } from './Timer';

export class FrameStatistics {
  private static COUNTERS = Array.from({ length: StatisticsCounterType.Length }, () => 0);

  static clear() {
    this.COUNTERS.fill(0);
    this.draw.clear();
    this.positionalInputQueue.clear();
    this.nonPositionalInputQueue.clear();
    this.frame.clear();
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

  static readonly positionalInputQueue = new Timer();

  static readonly nonPositionalInputQueue = new Timer();

  static readonly draw = new Timer();

  static readonly updateSubTree = new Timer();

  static readonly updateSubTreeTransforms = new Timer();

  static readonly frame = new Timer();
}
