import {Mod} from "./Mod.ts";
import {Vec2} from "@osucad/common";
import {HitObjectDrawable} from "../drawables/hitObjects/HitObjectDrawable.ts";
import {EditorClock} from "../clock.ts";

const cameraPosition = {
  x: 256,
  y: 192,
  z: -200,
};

export class DepthMod extends Mod {

  constructor(private readonly clock: EditorClock) {
    super();
  }

  maxDepth = 100;

  applyTransform(drawable: HitObjectDrawable) {
    const hitObject = drawable.hitObject;

    const timePreempt = hitObject.timePreempt;
    const speed = this.maxDepth / timePreempt;

    const appearTime = hitObject.startTime - timePreempt;
    const time = this.clock.currentTimeAnimated;
    const z = this.maxDepth - (Math.max(time, appearTime) - appearTime) * speed;

    const scale = this.scaleForDepth(z);
    drawable.position.copyFrom(this.toPlayfieldPosition(scale, hitObject.stackedPosition));
    drawable.scale.set(hitObject.scale * scale);

    drawable.hitObject.depthInfo = {
      position: new Vec2(drawable.position.x, drawable.position.y),
      scale: scale,
    };
  }

  scaleForDepth(depth: number) {
    return -cameraPosition.z / Math.max(1, depth - cameraPosition.z);
  }

  depthForScale(scale: number) {
    return -cameraPosition.z * scale + cameraPosition.z;
  }

  toPlayfieldPosition(scale: number, positionAtZeroDepth: Vec2) {
    return new Vec2(
      (positionAtZeroDepth.x - cameraPosition.x) * scale + cameraPosition.x,
      (positionAtZeroDepth.y - cameraPosition.y) * scale + cameraPosition.y,
    );
  }
}