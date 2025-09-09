import { BeatmapDifficultyInfo } from "../../beatmaps";

import { HitResult } from "./HitResult";

export class DifficultyRange
{
  public constructor(
    public readonly result: HitResult,
    public readonly min: number,
    public readonly average: number,
    public readonly max: number,
  )
  {
  }
}


export class HitWindows
{
  public static get Empty()
  {
    return new EmptyHitWindows();
  }

  public static readonly base_ranges = [
    new DifficultyRange(HitResult.Perfect, 22.4, 19.4, 13.9),
    new DifficultyRange(HitResult.Great, 64, 49, 34),
    new DifficultyRange(HitResult.Good, 97, 82, 67),
    new DifficultyRange(HitResult.Ok, 127, 112, 97),
    new DifficultyRange(HitResult.Meh, 151, 136, 121),
    new DifficultyRange(HitResult.Miss, 188, 173, 158),
  ];

  #perfect: number = 0;
  #great: number = 0;
  #good: number = 0;
  #ok: number = 0;
  #meh: number = 0;
  #miss: number = 0;

  protected lowestSuccessfulHitResult(): HitResult
  {
    for (let result = HitResult.Meh; result <= HitResult.Perfect; result++)
    {
      if (this.isHitResultAllowed(result))
        return result;
    }

    return HitResult.None;
  }

  public* getAvailableWindows()
  {
    for (let result = HitResult.Meh; result <= HitResult.Perfect; result++)
    {
      if (this.isHitResultAllowed(result))
        yield result;
    }
  }

  public isHitResultAllowed(result: HitResult): boolean
  {
    return true;
  }

  public setDifficulty(difficulty: number)
  {
    for (const range of this.getRanges())
    {
      const value = BeatmapDifficultyInfo.difficultyRange(difficulty, range.min, range.average, range.max);

      switch (range.result)
      {
      case HitResult.Miss:
        this.#miss = value;
        break;

      case HitResult.Meh:
        this.#meh = value;
        break;

      case HitResult.Ok:
        this.#ok = value;
        break;

      case HitResult.Good:
        this.#good = value;
        break;

      case HitResult.Great:
        this.#great = value;
        break;

      case HitResult.Perfect:
        this.#perfect = value;
        break;
      }
    }
  }

  public resultFor(timeOffset: number): HitResult
  {
    timeOffset = Math.abs(timeOffset);

    for (let result = HitResult.Perfect; result >= HitResult.Miss; --result)
    {
      if (this.isHitResultAllowed(result) && timeOffset <= this.windowFor(result))
        return result;
    }

    return HitResult.None;
  }

  public windowFor(result: HitResult)
  {
    switch (result)
    {
    case HitResult.Perfect:
      return this.#perfect;

    case HitResult.Great:
      return this.#great;

    case HitResult.Good:
      return this.#good;

    case HitResult.Ok:
      return this.#ok;

    case HitResult.Meh:
      return this.#meh;

    case HitResult.Miss:
      return this.#miss;

    default:
      throw new Error(`Unknown enum member ${result}`);
    }
  }

  public canBeHit(timeOffset: number)
  {
    return timeOffset <= this.windowFor(this.lowestSuccessfulHitResult());
  }

  public getRanges(): DifficultyRange[]
  {
    return HitWindows.base_ranges;
  }
}

export class EmptyHitWindows extends HitWindows
{
  private static readonly ranges: DifficultyRange[] = [
    new DifficultyRange(HitResult.Perfect, 0, 0, 0),
    new DifficultyRange(HitResult.Miss, 0, 0, 0),
  ];

  public override isHitResultAllowed(result: HitResult): boolean
  {
    switch (result)
    {
    case HitResult.Perfect:
    case HitResult.Miss:
      return true;
    default:
      return false;
    }
  }

  public override getRanges(): DifficultyRange[]
  {
    return EmptyHitWindows.ranges;
  }
}
