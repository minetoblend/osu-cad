import { HitObject, Vec2 } from '@osucad/common';
import { HitObjectDrawable } from './hitObjects/HitObjectDrawable.ts';
import { EditorClock } from '../clock.ts';

const maxDepth = 100;

export function applyDepth(
  drawable: HitObjectDrawable,
  hitObject: HitObject,
  clock: EditorClock,
) {
  const timePreempt = hitObject.timePreempt;
  const speed = maxDepth / timePreempt;
  const appearTime = hitObject.startTime - timePreempt;
  const time = clock.currentTimeAnimated;
  const z = maxDepth - (Math.max(time, appearTime) - appearTime) * speed;

  const scale = scaleForDepth(z);
  drawable.position.copyFrom(
    toPlayfieldPosition(scale, hitObject.stackedPosition),
  );
  drawable.scale.set(hitObject.scale * scale);

  drawable.hitObject.depthInfo = {
    position: new Vec2(drawable.position.x, drawable.position.y),
    scale: scale,
  };
}

const cameraPosition = {
  x: 256,
  y: 192,
  z: -200,
};

function scaleForDepth(depth: number) {
  return -cameraPosition.z / Math.max(1, depth - cameraPosition.z);
}

function toPlayfieldPosition(scale: number, positionAtZeroDepth: Vec2) {
  return new Vec2(
    (positionAtZeroDepth.x - cameraPosition.x) * scale + cameraPosition.x,
    (positionAtZeroDepth.y - cameraPosition.y) * scale + cameraPosition.y,
  );
}
