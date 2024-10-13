import { Anchor, BindableNumber, dependencyLoader, PoolableDrawable, provide } from 'osucad-framework';
import { IAnimationTimeReference } from '../../skinning/IAnimationTimeReference';
import { OsuSkinComponentLookup } from '../../skinning/OsuSkinComponentLookup';
import { SkinnableDrawable } from '../../skinning/SkinnableDrawable';

@provide(IAnimationTimeReference)
export class FollowPoint extends PoolableDrawable implements IAnimationTimeReference {
  animationStartTime = new BindableNumber(0);

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
