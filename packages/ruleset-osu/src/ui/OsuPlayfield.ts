import type { DrawableHitObject, GameplayCursorContainer, HitObject, HitObjectLifetimeEntry } from "@osucad/core";
import { Playfield } from "@osucad/core";
import { Axes, type Drawable, LifetimeManagementContainer, ProxyDrawable, type ReadonlyDependencyContainer } from "@osucad/framework";
import { DrawableHitCircle } from "../hitObjects/drawables/DrawableHitCircle";
import { DrawableSlider } from "../hitObjects/drawables/DrawableSlider";
import { DrawableSpinner } from "../hitObjects/drawables/DrawableSpinner";
import { FollowPointRenderer } from "../hitObjects/drawables/FollowPointRenderer";
import { OsuHitObjectLifetimeEntry } from "../hitObjects/drawables/OsuHitObjectLifetimeEntry";
import { HitCircle } from "../hitObjects/HitCircle";
import type { OsuHitObject } from "../hitObjects/OsuHitObject";
import { Slider } from "../hitObjects/Slider";
import { Spinner } from "../hitObjects/Spinner";
import { SliderHeadCircle } from "../hitObjects/SliderHeadCircle";
import { DrawableSliderHead } from "../hitObjects/drawables/DrawableSliderHead";
import { SliderTailCircle } from "../hitObjects/SliderTailCircle";
import { DrawableSliderTail } from "../hitObjects/drawables/DrawableSliderTail";
import { SliderRepeat } from "../hitObjects/SliderRepeat";
import { DrawableSliderRepeat } from "../hitObjects/drawables/DrawableSliderRepeat";
import { SliderTick } from "../hitObjects/SliderTick";
import { DrawableSliderTick } from "../hitObjects/drawables/DrawableSliderTick";
import { OsuCursorContainer } from "./OsuCursorContainer";

export class OsuPlayfield extends Playfield
{
  constructor()
  {
    super();
  }

  private approachCircles!: ProxyContainer;

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.registerPool(HitCircle, DrawableHitCircle, 10, 100);
    this.registerPool(Slider, DrawableSlider, 10, 20);
    this.registerPool(Spinner, DrawableSpinner, 3, 10);
    this.registerPool(SliderHeadCircle, DrawableSliderHead, 10, 100);
    this.registerPool(SliderTailCircle, DrawableSliderTail, 10, 100);
    this.registerPool(SliderRepeat, DrawableSliderRepeat, 20, 100);
    this.registerPool(SliderTick, DrawableSliderTick, 20, 100);

    this.addRangeInternal([
      this.followPoints = new FollowPointRenderer(),
      this.hitObjectContainer,
      this.approachCircles = new ProxyContainer({ relativeSizeAxes: Axes.Both }),
    ]);
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

  protected override onNewDrawableHitObject(drawableHitObject: DrawableHitObject)
  {
    drawableHitObject.onLoadComplete.addListener(this.#onDrawableHitObjectLoaded, this);
  }

  #onDrawableHitObjectLoaded(drawable: Drawable)
  {
    if (drawable instanceof DrawableHitCircle)
    {
      this.approachCircles.add(new ProxyDrawable(drawable.proxiedLayer));
    }
  }

  protected override createCursor(): GameplayCursorContainer | null
  {
    return new OsuCursorContainer();
  }
}

class ProxyContainer extends LifetimeManagementContainer
{
  public add(child: Drawable)
  {
    return this.addInternal(child);
  }
}
