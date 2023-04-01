import {IObjectAttributes, ITypeFactory, IUnisonRuntime, SharedMap,} from "@osucad/unison";

export type IColor = number;

export class BeatmapColors extends SharedMap {

  constructor(runtime: IUnisonRuntime) {
    super(runtime, BeatmapColorsFactory.Attributes);
  }

  initializeFirstTime(): void {
    this.set("length", 0);
  }

  private _colors: IColor[] = [];

  get colors(): IColor[] {
    return this._colors;
  }

  insert(color: IColor, index: number = this.length): void {
    for (let i = this.length; i > index; i--) {
      this.set(i.toString(), this.get((i - 1).toString()));
    }
    this.set(index.toString(), color);
    this.set("length", this.length + 1);
  }

  remove(index: number): void {
    for (let i = index; i < this.length - 1; i++) {
      this.set(i.toString(), this.get((i + 1).toString()));
    }
    this.delete((this.length - 1).toString());
    this.set("length", this.length - 1);
  }

  setColor(index: string, color: IColor) {
    this.set(index.toString(), color);
  }

  getColor(index: number): IColor {
    return this.get((index % this.length).toString()) as IColor;
  }

  onChange() {
    this.updateColors();
  }

  updateColors() {
    const colors: IColor[] = [];
    for (let i = 0; i < this.length; i++) {
      colors.push(this.get(i.toString()) as IColor);
    }
    this._colors = colors;
  }

  get length(): number {
    return this.get("length") as number;
  }
}

export class BeatmapColorsFactory implements ITypeFactory<BeatmapColors> {
  static readonly Type = "@osucad/beatmapColors";

  get type() {
    return BeatmapColorsFactory.Type;
  }

  static readonly Attributes: IObjectAttributes = {
    type: BeatmapColorsFactory.Type,
    version: "0.1",
  };

  get attributes() {
    return BeatmapColorsFactory.Attributes;
  }

  create(runtime: IUnisonRuntime): BeatmapColors {
    return new BeatmapColors(runtime);
  }
}
