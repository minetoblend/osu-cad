import { injectionToken } from "@osucad/framework";
import type { DrawableHitObject } from "../hitObjects/drawables/DrawableHitObject";
import type { HitObject } from "../hitObjects/HitObject";

export interface IPooledHitObjectProvider
{
  getPooledDrawableRepresentation(hitObject: HitObject): DrawableHitObject | undefined;
}

export const IPooledHitObjectProvider = injectionToken<IPooledHitObjectProvider>();
