import { DrawableHitObject, IComboNumberReference } from "@osucad/core";
import { Bindable, type Drawable, provide, Vec2 } from "@osucad/framework";
import type { OsuHitObject } from "../OsuHitObject";
import { OsuInputManager } from "../../ui/OsuInputManager";
import type { DrawableSlider } from "./DrawableSlider";
import type { SliderTailCircle } from "../SliderTailCircle";

@provide(IComboNumberReference)
export abstract class DrawableOsuHitObject<out T extends OsuHitObject = OsuHitObject>
  extends DrawableHitObject<T>
  implements IComboNumberReference
{
  readonly positionBindable = new Bindable(Vec2.zero());
  readonly scaleBindable = new Bindable(1);
  readonly indexInComboBindable = new Bindable(0);
  readonly comboIndexBindable = new Bindable(0);
  readonly stackHeightBindable = new Bindable(0);

  protected override onApplied()
  {
    super.onApplied();

    this.positionBindable.bindTo(this.hitObject.positionBindable);
    this.scaleBindable.bindTo(this.hitObject.scaleBindable);
    this.indexInComboBindable.bindTo(this.hitObject.indexInComboBindable);
    this.comboIndexBindable.bindTo(this.hitObject.comboIndexBindable);
    this.stackHeightBindable.bindTo(this.hitObject.stackHeightBindable);
  }

  protected override onFreed()
  {
    super.onFreed();

    this.positionBindable.unbindFrom(this.hitObject.positionBindable);
    this.scaleBindable.unbindFrom(this.hitObject.scaleBindable);
    this.indexInComboBindable.unbindFrom(this.hitObject.indexInComboBindable);
    this.comboIndexBindable.unbindFrom(this.hitObject.comboIndexBindable);
    this.stackHeightBindable.unbindFrom(this.hitObject.stackHeightBindable);
  }

  protected override loadAsyncComplete()
  {
    super.loadAsyncComplete();

    this.positionBindable.bindValueChanged(() => this.updatePosition());
    this.stackHeightBindable.bindValueChanged(() => this.updatePosition());
    this.scaleBindable.bindValueChanged((scale) => this.updateScale(scale.value));
    this.indexInComboBindable.bindValueChanged(() => this.scheduler.addOnce(this.updateComboColor, this));
  }

  protected override loadComplete()
  {
    super.loadComplete();
  }

  protected abstract updatePosition(): void;

  protected abstract updateScale(scale: number): void;

  protected override updateComboColor()
  {
    this.accentColor.value = this.skin.getComboColor(this.comboIndexBindable.value);
  }

  protected override get initialLifetimeOffset(): number
  {
    return this.hitObject.timePreempt;
  }

  public override shake()
  {
  }

  hitForcefully()
  {
    this.applyMaxResult();
  }

  missForcefully()
  {
    this.applyMinResult();
  }

  #osuActionInputManager: OsuInputManager | null = null;

  get osuActionInputManager()
  {
    if (!this.#osuActionInputManager)
    {
      const inputManager = this.getContainingInputManager();
      if (inputManager instanceof OsuInputManager)
        this.#osuActionInputManager = inputManager;
    }

    return this.#osuActionInputManager;
  }

  protected applyRepeatFadeIn(target: Drawable, fadeTime: number)
  {
    const slider = this.parentHitObject as DrawableSlider;

    const repeatIndex = (this.hitObject as unknown as SliderTailCircle).repeatIndex;

    console.assert(slider !== null);

    // When snaking in is enabled, the first end circle needs to be delayed until the snaking completes.
    const delayFadeIn = slider.sliderBody?.snakingIn.value == true && repeatIndex == 0;

    if (repeatIndex > 0)
      fadeTime = Math.min(slider.hitObject.spanDuration(), fadeTime);

    target
      .fadeOut()
      .delay(delayFadeIn ? (slider.hitObject.timePreempt) / 3 : 0)
      .fadeIn(fadeTime);
  }
}
