import type { DrawableHitObject, IBeatmap, PlayfieldAdjustmentContainer, Ruleset } from '@osucad/common';
import type { PassThroughInputManager } from 'osucad-framework';
import type { OsuHitObject } from './hitObjects/OsuHitObject';
import { DrawableRuleset } from '@osucad/common';
import { OsuInputManager } from './OsuInputManager';
import { OsuPlayfieldAdjustmentContainer } from './OsuPlayfieldAdjustmentContainer';
import { OsuPlayfield } from './ui/OsuPlayfield';

export class DrawableOsuRuleset extends DrawableRuleset<OsuHitObject> {
  constructor(ruleset: Ruleset, beatmap: IBeatmap<OsuHitObject>) {
    super(ruleset, beatmap);
  }

  override createPlayfield(): OsuPlayfield {
    return new OsuPlayfield();
  }

  override createDrawableRepresentation(hitObject: OsuHitObject): DrawableHitObject | null {
    return null;
  }

  override createInputManager(): PassThroughInputManager {
    return new OsuInputManager(this.ruleset.rulesetInfo);
  }

  override createPlayfieldAdjustmentContainer(): PlayfieldAdjustmentContainer {
    return new OsuPlayfieldAdjustmentContainer();
  }
}
