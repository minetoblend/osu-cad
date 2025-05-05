import { HitObject, HitObjectLifetimeEntry, Playfield } from "@osucad/core";
import { ReadonlyDependencyContainer } from "@osucad/framework";
import { DrawableHitCircle } from "../hitObjects/drawables/DrawableHitCircle";
import { DrawableSlider } from "../hitObjects/drawables/DrawableSlider";
import { FollowPointRenderer } from "../hitObjects/drawables/FollowPointRenderer";
import { OsuHitObjectLifetimeEntry } from "../hitObjects/drawables/OsuHitObjectLifetimeEntry";
import { HitCircle } from "../hitObjects/HitCircle";
import { OsuHitObject } from "../hitObjects/OsuHitObject";
import { Slider } from "../hitObjects/Slider";

export class OsuPlayfield extends Playfield 
{
  protected override load(dependencies: ReadonlyDependencyContainer) 
  {
    super.load(dependencies);

    this.registerPool(HitCircle, DrawableHitCircle, 10, 100);
    this.registerPool(Slider, DrawableSlider, 10, 20);

    this.addInternal(this.followPoints = new FollowPointRenderer());
    this.addInternal(this.hitObjectContainer);
  }

  protected followPoints!: FollowPointRenderer;

  protected override onHitObjectAdded(hitObject: HitObject) 
  {
    super.onHitObjectAdded(hitObject);

    this.followPoints.addFollowPoints(hitObject as OsuHitObject);
  }

  protected override onHitObjectRemoved(hitObject: HitObject) 
  {
    super.onHitObjectRemoved(hitObject);

    this.followPoints.removeFollowPoints(hitObject as OsuHitObject);
  }

  protected override createLifetimeEntry(hitObject: HitObject): HitObjectLifetimeEntry 
  {
    return new OsuHitObjectLifetimeEntry(hitObject as OsuHitObject);
  }
}
