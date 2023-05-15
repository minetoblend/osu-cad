import { Rectangle } from "pixi.js";

import {
  IObjectAttributes,
  ITypeFactory,
  IUnisonRuntime,
  SharedMap,
} from "@osucad/unison";
import { HitObjectBase } from "./hitObject";

export class Circle extends HitObjectBase {
  constructor(runtime: IUnisonRuntime) {
    super(runtime, CircleFactory.Attributes);
  }

  calculateBounds(): Rectangle {
    return new Rectangle(this.position.x, this.position.y, 0, 0);
  }

  contains(x: number, y: number): boolean {
    const radius = 28;
    const dx = this.position.x - x;
    const dy = this.position.y - y;
    const distanceSq = dx * dx + dy * dy;
    return distanceSq < radius * radius;
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
