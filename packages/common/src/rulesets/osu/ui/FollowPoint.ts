import { Anchor, BindableNumber, dependencyLoader, PoolableDrawable, provide } from 'osucad-framework';
import { IAnimationTimeReference } from '../../../skinning/IAnimationTimeReference';
import { SkinnableDrawable } from '../../../skinning/SkinnableDrawable';
import { OsuSkinComponentLookup } from '../skinning/stable/OsuSkinComponentLookup';

@provide(IAnimationTimeReference)
export class FollowPoint extends PoolableDrawable implements IAnimationTimeReference {
  animationStartTime = new BindableNumber(0);

  override get removeWhenNotAlive() {
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
