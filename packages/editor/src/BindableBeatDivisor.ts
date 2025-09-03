import type { Bindable } from "@osucad/framework";
import { BindableNumber, Vec2 } from "@osucad/framework";
import { EditorColors } from "./EditorColors";

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

  public static getColorFor(beatDivisor: number)
  {
    switch (beatDivisor)
    {
    case 1:
      return EditorColors.white;
    case 2:
      return EditorColors.red;
    case 4:
      return EditorColors.blue;
    case 8:
      return EditorColors.yellow;
    case 16:
      return EditorColors.purpleDark;
    case 3:
      return EditorColors.purple;
    case 6:
      return EditorColors.yellowDark;
    case 12:
      return EditorColors.yellowDarker;
    default:
      return 0xFF0000;
    }
  }

  public static getSize(beatDivisor: number): Vec2
  {
    switch (beatDivisor)
    {
    case 1:
      return new Vec2(1, 0.2);
    case 2:
      return new Vec2(1, 0.15);
    case 3:
    case 4:
      return new Vec2(0.8, 0.1);
    case 6:
    case 8:
      return new Vec2(0.8, 0.1);
    default:
      return new Vec2(0.8, 0.1);
    }
  }
}
