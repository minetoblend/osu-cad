import {
  IObjectAttributes,
  ITypeFactory,
  IUnisonRuntime,
  SharedMap,
} from "@osucad/unison";

export class TimingPoint extends SharedMap {
  constructor(runtime: IUnisonRuntime) {
    super(runtime, TimingPointFactory.Attributes);
  }

  initializeFirstTime(): void {
    this.set("offset", 0);
    this.set("beatDuration", null);
    this.set("velocity", null);
  }

  get offset(): number {
    return this.get("offset") as number;
  }

  set offset(value: number) {
    this.set("offset", value);
  }

  get bpm(): number | null {
    if (this.beatDuration === null) return null;
    return 60_000 / this.beatDuration;
  }

  set bpm(value: number | null) {
    if (value === null) {
      this.set("beatDuration", null);
      return;
    }
    if (value < 1) value = 1;
    this.set("beatDuration", 60_000 / value);
  }

  get beatDuration(): number | null {
    return this.get("beatDuration") as number | null;
  }

  set beatDuration(value: number | null) {
    this.set("beatDuration", value);
  }

  get velocity(): number | null {
    return this.get("velocity") as number | null;
  }

  set velocity(value: number | null) {
    this.set("velocity", value);
  }

  get isInherited() {
    return this.beatDuration === null;
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
