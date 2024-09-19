import { Anchor, dependencyLoader, PoolableDrawable } from 'osucad-framework';
import { OsuSkinComponentLookup } from '../../skinning/OsuSkinComponentLookup';
import { SkinnableDrawable } from '../../skinning/SkinnableDrawable';

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
