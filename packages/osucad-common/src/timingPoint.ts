import {IObjectAttributes, ITypeFactory, IUnisonRuntime, SharedMap} from "@osucad/unison";

export class TimingPoint extends SharedMap {
  constructor(runtime: IUnisonRuntime) {
    super(runtime, TimingPointFactory.Attributes);
  }

  initializeFirstTime(): void {
    this.set("offset", 0);
    this.set("beatDuration", 333.333);
  }

  get offset(): number {
    return this.get("offset") as number;
  }

  set offset(value: number) {
    this.set("offset", value);
  }

  get bpm(): number {
    return 60_000 / this.beatDuration;
  }

  set bpm(value: number) {
    if (value < 1) value = 1;

    this.set("beatDuration", 60_000 / value);
  }

  get beatDuration(): number {
    return this.get("beatDuration") as number;
  }

  set beatDuration(value: number) {
    this.set("beatDuration", value);
  }

  get isInherited() {
    return true;
  }
}

export class TimingPointFactory implements ITypeFactory<TimingPoint> {
  static readonly Type = "@osucad/timingPoint";

  get type() {
    return TimingPointFactory.Type;
  }

  static readonly Attributes: IObjectAttributes = {
    type: TimingPointFactory.Type,
    version: "0.1",
  };

  get attributes() {
    return TimingPointFactory.Attributes;
  }

  create(runtime: IUnisonRuntime): TimingPoint {
    return new TimingPoint(runtime);
  }
}
