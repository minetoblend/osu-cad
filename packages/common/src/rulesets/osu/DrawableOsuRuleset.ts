import type { PassThroughInputManager } from 'osucad-framework';
import type { IBeatmap } from '../../beatmap/IBeatmap';
import type { DrawableHitObject } from '../../hitObjects';
import type { Ruleset } from '../Ruleset';
import type { PlayfieldAdjustmentContainer } from '../ui/PlayfieldAdjustmentContainer';
import type { OsuHitObject } from './hitObjects/OsuHitObject';
import { DrawableRuleset } from '../DrawableRuleset';
import { OsuInputManager } from './OsuInputManager';
import { OsuPlayfieldAdjustmentContainer } from './OsuPlayfieldAdjustmentContainer';
import { OsuPlayfield } from './ui/OsuPlayfield';

export class DrawableOsuRuleset extends DrawableRuleset<OsuHitObject> {
  constructor(ruleset: Ruleset, beatmap: IBeatmap) {
    super(ruleset, beatmap);
  }

  override createPlayfield(): OsuPlayfield {
    return new OsuPlayfield();
  }

  override createDrawableRepresentation(hitObject: OsuHitObject): DrawableHitObject | null {
    return null;
  }

  override createInputManager(): PassThroughInputManager {
    return new OsuInputManager(this.ruleset);
  }

  override createPlayfieldAdjustmentContainer(): PlayfieldAdjustmentContainer {
    return new OsuPlayfieldAdjustmentContainer();
  }
}
