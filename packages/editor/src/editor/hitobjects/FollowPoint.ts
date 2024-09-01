import { Anchor, PoolableDrawable, dependencyLoader } from 'osucad-framework';
import { SkinnableDrawable } from '../../skinning/SkinnableDrawable';
import { OsuSkinComponentLookup } from '../../skinning/OsuSkinComponentLookup';

export class FollowPoint extends PoolableDrawable {
  get removeWhenNotAlive() {
    return false;
  }

  @dependencyLoader()
  load() {
    this.origin = Anchor.Center;

    this.addInternal(
      new SkinnableDrawable(OsuSkinComponentLookup.FollowPoint),
    );
  }
}
