import { HitObjectDrawable } from '../drawables/hitObjects/HitObjectDrawable.ts';

export class Mod {
  // @ts-expect-error this is expected to be overridden
  applyTransform(drawable: HitObjectDrawable) {}
}
