import type { Bindable } from "@osucad/framework";
import { BindableNumber, Vec2 } from "@osucad/framework";

export class BindableBeatDivisor extends BindableNumber
{
  public constructor(value: number = 1)
  {
    super(value);

    this.minValue = 1;
    this.maxValue = 16;
    this.precision = 1;
  }

  public static readonly PREDEFINED_DIVISORS = [1, 2, 3, 4, 6, 8, 12, 16];

  public override createInstance(): Bindable<number>
  {
    return new BindableBeatDivisor();
  }

  public static getDivisorForBeatIndex(index: number, beatDivisor: number, validDivisors: number[] = this.PREDEFINED_DIVISORS): number
  {
    const beat = index % beatDivisor;

    for (const divisor of validDivisors)
    {
      if ((beat * divisor) % beatDivisor === 0)
        return divisor;
    }

    return 0;
  }

  // static getColorFor(beatDivisor: number)
  // {
  //   switch (beatDivisor)
  //   {
  //   case 1:
  //     return OsucadColors.white;
  //   case 2:
  //     return OsucadColors.red;
  //   case 4:
  //     return OsucadColors.blue;
  //   case 8:
  //     return OsucadColors.yellow;
  //   case 16:
  //     return OsucadColors.purpleDark;
  //   case 3:
  //     return OsucadColors.purple;
  //   case 6:
  //     return OsucadColors.yellowDark;
  //   case 12:
  //     return OsucadColors.yellowDarker;
  //   default:
  //     return 0xFF0000;
  //   }
  // }

  public static getSize(beatDivisor: number): Vec2
  {
    switch (beatDivisor)
    {
    case 1:
    case 2:
      return new Vec2(1, 0.9);
    case 3:
    case 4:
      return new Vec2(0.8, 0.8);
    case 6:
    case 8:
      return new Vec2(0.8, 0.7);
    default:
      return new Vec2(0.8, 0.6);
    }
  }
}
