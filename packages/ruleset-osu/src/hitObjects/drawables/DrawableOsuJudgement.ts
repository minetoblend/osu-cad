import type { DrawableHitObject, JudgementResult } from "@osucad/core";
import { DrawableJudgement } from "@osucad/core";
import { Vec2 } from "@osucad/framework";
import { Bindable } from "@osucad/framework";
import { Color } from "pixi.js";
import { DrawableOsuHitObject } from "./DrawableOsuHitObject";
import { DrawableSlider } from "./DrawableSlider";

export class DrawableOsuJudgement extends DrawableJudgement
{
  readonly accentColor = new Bindable(new Color(0xffffff));

  // TODO: lighting

  #screenSpacePosition!: Vec2;

  override apply(result: JudgementResult, judgedObject?: DrawableHitObject)
  {
    super.apply(result, judgedObject);

    if (!(judgedObject instanceof DrawableOsuHitObject))
      return;

    this.accentColor.value = judgedObject.accentColor.value;

    if (judgedObject instanceof DrawableSlider)
    {
      this.#screenSpacePosition = judgedObject.sliderTail.toScreenSpace(Vec2.zero());
    }
    else
    {
      this.#screenSpacePosition = judgedObject.toScreenSpace(Vec2.zero());
    }

    this.scale = judgedObject.scale;
  }

  protected override prepareForUse()
  {
    super.prepareForUse();

    this.position = this.parent!.toLocalSpace(this.#screenSpacePosition);
  }

  protected override applyHitAnimations()
  {
    super.applyHitAnimations();
  }

  protected override applyMissAnimations()
  {
    super.applyMissAnimations();
  }
}
