import { IAnimationTimeReference, SkinnableDrawable } from "@osucad/core";
import type { ReadonlyDependencyContainer } from "@osucad/framework";
import { Anchor, BindableNumber, PoolableDrawable, provideSelf } from "@osucad/framework";
import { OsuSkinComponents } from "../../skinning/OsuSkinComponents";

@provideSelf(IAnimationTimeReference)
export class FollowPoint extends PoolableDrawable implements IAnimationTimeReference
{
  public animationStartTime = new BindableNumber(0);

  public override get removeWhenNotAlive()
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
