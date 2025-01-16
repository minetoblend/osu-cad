import type { Playfield } from '@osucad/core';
import { DrawableManiaRuleset } from './DrawableManiaRuleset';

export class DrawableManiaEditorRuleset extends DrawableManiaRuleset {
  override createPlayfield(): Playfield {
    return super.createPlayfield().adjust((it) => {
      it.hitObjectsAlwaysHit = true;
      it.suppressHitSounds = true;
    });
  }
}
