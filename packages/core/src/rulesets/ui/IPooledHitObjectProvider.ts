import { injectionToken } from "@osucad/framework";
import { DrawableHitObject } from "../hitObjects/drawables/DrawableHitObject";
import { HitObject } from "../hitObjects/HitObject";

export interface IPooledHitObjectProvider {
  getPooledDrawableRepresentation(hitObject: HitObject): DrawableHitObject | undefined;
}

export const IPooledHitObjectProvider = injectionToken<IPooledHitObjectProvider>()