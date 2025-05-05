import { IAnimationTimeReference, SkinnableDrawable } from "@osucad/core";
import { Anchor, BindableNumber, PoolableDrawable, provide, ReadonlyDependencyContainer } from "@osucad/framework";
import { OsuSkinComponents } from "../../skinning/OsuSkinComponents";

@provide(IAnimationTimeReference)
export class FollowPoint extends PoolableDrawable implements IAnimationTimeReference 
{
  animationStartTime = new BindableNumber(0);

  override get removeWhenNotAlive() 
  {
    return false;
  }

  protected override load(dependencies: ReadonlyDependencyContainer) 
  {
    super.load(dependencies);

    this.origin = Anchor.Center;

    this.addInternal(
        new SkinnableDrawable(OsuSkinComponents.FollowPoint),
    );
  }
}
