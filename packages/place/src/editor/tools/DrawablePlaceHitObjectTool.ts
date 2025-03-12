import type { OsuHitObject } from '@osucad/ruleset-osu';
import { DrawableOsuHitObjectPlacementTool } from '@osucad/ruleset-osu';

export abstract class DrawablePlaceHitObjectTool<T extends OsuHitObject> extends DrawableOsuHitObjectPlacementTool<T> {

}
