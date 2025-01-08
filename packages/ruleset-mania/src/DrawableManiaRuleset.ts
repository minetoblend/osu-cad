import type { DrawableHitObject, HitObject, IBeatmap, Playfield, Ruleset } from '@osucad/common';
import { DrawableRuleset } from '@osucad/common';
import { PassThroughInputManager } from 'osucad-framework';
import { ManiaPlayfield } from './ManiaPlayfield';

export class DrawableManiaRuleset extends DrawableRuleset {
  constructor(ruleset: Ruleset, beatmap: IBeatmap) {
    super(ruleset, beatmap);
  }

  override createDrawableRepresentation(hitObject: HitObject): DrawableHitObject | null {
    return null;
  }

  override createInputManager(): PassThroughInputManager {
    return new PassThroughInputManager();
  }

  override createPlayfield(): Playfield {
    return new ManiaPlayfield();
  }
}
