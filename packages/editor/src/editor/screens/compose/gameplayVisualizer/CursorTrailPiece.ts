import { OsuSkinComponentLookup, SkinnableDrawable } from '@osucad/common';
import { dependencyLoader, PoolableDrawable } from 'osucad-framework';

export class CursorTrailPiece extends PoolableDrawable {
  @dependencyLoader()
  load() {
    this.addInternal(
      new SkinnableDrawable(OsuSkinComponentLookup.CursorTrail).with({
        alpha: 0.65,
      }),
    );
  }

  override get removeCompletedTransforms() {
    return false;
  }

  override set removeCompletedTransforms(value) {
    // Do nothing
  }
}
