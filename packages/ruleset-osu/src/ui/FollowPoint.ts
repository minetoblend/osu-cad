import { IAnimationTimeReference, SkinnableDrawable } from '@osucad/common';
import {
  Anchor,
  BindableNumber,
  PoolableDrawable,
  provide,
  type ReadonlyDependencyContainer,
} from 'osucad-framework';
import { OsuSkinComponentLookup } from '../skinning/stable/OsuSkinComponentLookup';

@provide(IAnimationTimeReference)
export class FollowPoint extends PoolableDrawable implements IAnimationTimeReference {
  animationStartTime = new BindableNumber(0);

  override get removeWhenNotAlive() {
    return false;
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.origin = Anchor.Center;

    this.addInternal(
      new SkinnableDrawable(OsuSkinComponentLookup.FollowPoint),
    );
  }
}
