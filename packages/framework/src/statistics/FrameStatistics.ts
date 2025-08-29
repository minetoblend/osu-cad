import { StatisticsCounterType } from "./StatisticsCounterType";
import { Timer } from "./Timer";

export class FrameStatistics
{
  private static COUNTERS = Array.from({ length: StatisticsCounterType.Length }, () => 0);

  public static clear()
  {
    this.COUNTERS.fill(0);
    this.draw.clear();
    this.positionalInputQueue.clear();
    this.nonPositionalInputQueue.clear();
    this.frame.clear();
    this.updateSubTree.clear();
    this.updateSubTreeTransforms.clear();
  }

  public static increment(counterType: StatisticsCounterType)
  {
    this.COUNTERS[counterType]++;
  }

  public static add(counterType: StatisticsCounterType, value: number)
  {
    this.COUNTERS[counterType] += value;
  }

  public static get counters()
  {
    return this.COUNTERS as Readonly<number[]>;
  }

  public static readonly positionalInputQueue = new Timer();

  public static readonly nonPositionalInputQueue = new Timer();

  public static readonly draw = new Timer();

  public static readonly updateSubTree = new Timer();

  public static readonly updateSubTreeTransforms = new Timer();

  public static readonly audio = new Timer();

  public static readonly frame = new Timer();
}
