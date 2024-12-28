import { BindableNumber, Vec2 } from 'osucad-framework';
import { OsucadColors } from '../OsucadColors';

export class BindableBeatDivisor extends BindableNumber {
  constructor(value: number = 1) {
    super(value);
  }

  static readonly PREDEFINED_DIVISORS = [1, 2, 3, 4, 6, 8, 12, 16];

  static getDivisorForBeatIndex(index: number, beatDivisor: number, validDivisors: number[] = this.PREDEFINED_DIVISORS): number {
    const beat = index % beatDivisor;

    for (const divisor of validDivisors) {
      if ((beat * divisor) % beatDivisor === 0)
        return divisor;
    }

    return 0;
  }

  static getColorFor(beatDivisor: number) {
    switch (beatDivisor) {
      case 1:
        return OsucadColors.white;
      case 2:
        return OsucadColors.red;
      case 4:
        return OsucadColors.blue;
      case 8:
        return OsucadColors.yellow;
      case 16:
        return OsucadColors.purpleDark;
      case 3:
        return OsucadColors.purple;
      case 6:
        return OsucadColors.yellowDark;
      case 12:
        return OsucadColors.yellowDarker;
      default:
        return 0xFF0000;
    }
  }

  static getSize(beatDivisor: number) {
    switch (beatDivisor) {
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
