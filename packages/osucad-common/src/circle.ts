import {ref} from "vue";
import {IObjectAttributes, ITypeFactory, IUnisonRuntime, SharedMap,} from "@osucad/unison";

interface IVec2 {
  x: number;
  y: number;
}

export class Circle extends SharedMap {
  constructor(runtime: IUnisonRuntime) {
    super(runtime, CircleFactory.Attributes);
  }

  initializeFirstTime(): void {
    this.set("position", { x: 0, y: 0 });
    this.set("startTime", 0);
    this.set("newCombo", false);
  }

  get position() {
    return this.get("position") as IVec2;
  }

  set position(value: IVec2) {
    this.set("position", value);
  }

  get startTime() {
    return this.get("startTime") as number;
  }

  set startTime(value: number) {
    this.set("startTime", value);
  }

  get newCombo() {
    return this.get("newCombo") as boolean;
  }

  set newCombo(value: boolean) {
    this.set("newCombo", value);
  }

  #comboIndex = ref(0);
  #comboNumber = ref(0);

  get comboIndex() {
    return this.#comboIndex.value;
  }

  set comboIndex(value: number) {
    this.#comboIndex.value = value;
  }

  get comboNumber() {
    return this.#comboNumber.value;
  }

  set comboNumber(value: number) {
    this.#comboNumber.value = value;
  }
}

export class CircleFactory implements ITypeFactory<Circle> {
  static readonly Type = "@osucad/circle";

  get type() {
    return CircleFactory.Type;
  }

  static readonly Attributes: IObjectAttributes = {
    type: CircleFactory.Type,
    version: "0.1",
  };

  get attributes() {
    return CircleFactory.Attributes;
  }

  create(runtime: IUnisonRuntime): Circle {
    return new Circle(runtime);
  }

  get circleRadius() {
    return 32;
  }
}
