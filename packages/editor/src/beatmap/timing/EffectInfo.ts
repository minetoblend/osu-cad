export class EffectInfo {
  constructor(
    readonly kiaiMode: boolean = false,
  ) {
  }

  withKiai(kiai: boolean): EffectInfo {
    if (this.kiaiMode === kiai)
      return this;

    return new EffectInfo(kiai);
  }
}
