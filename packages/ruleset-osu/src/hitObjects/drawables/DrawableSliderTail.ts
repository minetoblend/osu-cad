import { DrawableOsuHitObject } from "./DrawableOsuHitObject";
import type { SliderTailCircle } from "../SliderTailCircle";
import { DrawableSlider } from "./DrawableSlider";
import { ArmedState, SkinnableDrawable } from "@osucad/core";
import { Anchor, type ReadonlyDependencyContainer } from "@osucad/framework";
import { OsuHitObject } from "../OsuHitObject";
import { OsuSkinComponents } from "../../skinning";

export class DrawableSliderTail extends DrawableOsuHitObject<SliderTailCircle>
{
  constructor(initialObject?: SliderTailCircle)
  {
    super(initialObject);
  }

  protected get drawableSlider(): DrawableSlider | null
  {
    if (this.parentHitObject instanceof DrawableSlider)
      return this.parentHitObject;

    return null;
  }

  get slider()
  {
    return this.drawableSlider?.hitObject ?? null;
  }

  circlePiece!: SkinnableDrawable;

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.origin = Anchor.Center;
    this.size = OsuHitObject.OBJECT_DIMENSIONS;

    this.addRangeInternal([
      this.circlePiece = new SkinnableDrawable(OsuSkinComponents.SliderTailHitCircle).with({
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
    ]);
  }

  protected override updatePosition(): void
  {
    if (this.slider)
      this.position = this.hitObject.position.sub(this.slider.position);
  }

  protected override updateScale(scale: number): void
  {
    this.scale = scale;
  }

  protected override updateInitialTransforms()
  {
    super.updateInitialTransforms();

    this.applyRepeatFadeIn(this.circlePiece, this.hitObject.timeFadeIn);
  }

  protected override updateHitStateTransforms(state: ArmedState)
  {
    super.updateHitStateTransforms(state);

    switch (state)
    {
    case ArmedState.Idle:
      this.delay(this.hitObject.timePreempt).fadeOut(500);
      break;

    case ArmedState.Miss:
      this.fadeOut(100);
      break;

    case ArmedState.Hit:
      this.delay(800).fadeOut();
    }
  }

  protected override checkForResult(userTriggered: boolean, timeOffset: number)
  {
    this.drawableSlider?.sliderInputManager.tryJudgeNestedObject(this, timeOffset);
  }

  protected override playSamples()
  {
  }
}
