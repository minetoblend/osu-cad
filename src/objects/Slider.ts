import {HitObject} from "@/objects/HitObject";
import {Vec2} from "@/util/math";

export class Slider extends HitObject {
  contains(position: Vec2): boolean {
    return false;
  }
}