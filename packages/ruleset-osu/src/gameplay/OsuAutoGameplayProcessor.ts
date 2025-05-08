import type { DrawableHitObject } from "@osucad/core";
import { ArmedState, GameplayProcessor } from "@osucad/core";
import type { OsuPlayfield } from "../ui";
import { DrawableHitCircle } from "../hitObjects/drawables/DrawableHitCircle";
import { DrawableSlider } from "../hitObjects/drawables/DrawableSlider";
import { DrawableSpinner } from "../hitObjects/drawables/DrawableSpinner";

type BaseDrawableHitObject = DrawableHitCircle | DrawableSlider | DrawableSpinner;

export class OsuAutoGameplayProcessor extends GameplayProcessor<OsuPlayfield>
{
  constructor(playfield: OsuPlayfield)
  {
    super(playfield);
  }

  protected override processFrame(currentTime: number, hitObjects: DrawableHitObject[]): void
  {
    for (const h of hitObjects as BaseDrawableHitObject[])
    {
      if (h instanceof DrawableHitCircle)
        this.handleHitCircle(h, currentTime);
      if (h instanceof DrawableSlider)
        this.handleSlider(h, currentTime);
      if (h instanceof DrawableSpinner)
        this.handleSpinner(h, currentTime);
    }
  }

  protected hasPassedEndTime(drawable: DrawableHitObject, currentTime: number)
  {
    return currentTime >= drawable.hitObject.endTime;
  }

  protected handleHitObject(drawable: DrawableHitObject, currentTime: number)
  {
    const state = this.hasPassedEndTime(drawable, currentTime) ? ArmedState.Hit : ArmedState.Idle;

    drawable.updateState(state);

    for (const nestedHitObject of drawable.nestedHitObjects)
      this.handleHitObject(nestedHitObject, currentTime);
  }

  protected handleHitCircle(drawable: DrawableHitCircle, currentTime: number)
  {
    this.handleHitObject(drawable, currentTime);
  }

  protected handleSlider(drawable: DrawableSlider, currentTime: number)
  {
    this.handleHitObject(drawable, currentTime);

    drawable.tracking.value = currentTime >= drawable.hitObject.startTime && currentTime < drawable.hitObject.endTime;
  }

  protected handleSpinner(drawable: DrawableSpinner, currentTime: number)
  {
    // TODO
  }

  override onHitObjectApplied(hitObject: DrawableHitObject)
  {
    if (this.time.current > hitObject.hitObject.endTime)
      hitObject.updateState(ArmedState.Hit, true);
  }
}
