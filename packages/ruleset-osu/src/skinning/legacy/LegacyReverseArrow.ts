import type { DrawableHitObject } from "@osucad/core";
import { ISkinSource } from "@osucad/core";
import type { ReadonlyDependencyContainer } from "@osucad/framework";
import { Anchor, Axes, Bindable, CompositeDrawable, DrawableSprite, EasingFunction, Interpolation, ProxyDrawable, resolved } from "@osucad/framework";
import { DrawableSliderRepeat } from "../../hitObjects/drawables/DrawableSliderRepeat";
import { Color } from "pixi.js";

export class LegacyReverseArrow extends CompositeDrawable
{
  @resolved(() => DrawableSliderRepeat)
  private drawableRepeat!: DrawableSliderRepeat;

  private readonly accentColor = new Bindable(new Color(0xffffff));

  @resolved(ISkinSource)
  private skinSource!: ISkinSource;


  #arrow!: DrawableSprite;

  #proxy!: ProxyDrawable;

  #shouldRotate = false; // TODO

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    const lookup_name = "reversearrow";

    this.autoSizeAxes = Axes.Both;

    const skin = this.skinSource.findProvider(s => s.getTexture(lookup_name) !== null);

    this.internalChild = this.#arrow = new DrawableSprite({
      anchor: Anchor.Center,
      origin: Anchor.Center,
      texture: skin?.getTexture(lookup_name),
    });
  }

  protected override loadComplete()
  {
    super.loadComplete();

    this.#proxy = new ProxyDrawable(this);

    this.drawableRepeat.hitObjectApplied.addListener(this.#onHitObjectApplied, this);
    this.#onHitObjectApplied(this.drawableRepeat);

    const textureIsDefaultSkin = true; // TODO

    this.accentColor.bindTo(this.drawableRepeat.accentColor);
    this.accentColor.bindValueChanged(c =>
    {
      this.#arrow.color = textureIsDefaultSkin && c.value.red + c.value.green + c.value.blue > (600 / 255) ? 0x000000 : 0xFFFFFF;
    }, true);
  }

  #onHitObjectApplied(hitObject: DrawableHitObject)
  {
    console.assert(!this.#proxy.parent);

    this.drawableRepeat.drawableSlider?.overlayElementContainer.add(this.#proxy);
  }

  override update()
  {
    super.update();

    const isHit = true; // TODO

    if (this.time.current >= this.drawableRepeat.hitStateUpdateTime && isHit)
    {
      const animDuration = Math.min(300, this.drawableRepeat.hitObject.spanDuration);
      this.#arrow.scale = Interpolation.valueAt(
          this.time.current,
          1,
          1.4,
          this.drawableRepeat.hitStateUpdateTime,
          this.drawableRepeat.hitStateUpdateTime + animDuration,
          EasingFunction.Out,
      );
    }
    else
    {
      const  duration = 300;
      const  rotation = 5.625;

      const loopCurrentTime = (this.time.current - this.drawableRepeat.animationStartTime.value) % duration;

      // Reference: https://github.com/peppy/osu-stable-reference/blob/2280c4c436f80d04f9c79d3c905db00ac2902273/osu!/GameplayElements/HitObjects/Osu/HitCircleSliderEnd.cs#L79-L96
      if (this.#shouldRotate)
      {
        this.#arrow.rotation = Interpolation.valueAt(loopCurrentTime, rotation, -rotation, 0, duration);
        this.#arrow.scale = Interpolation.valueAt(loopCurrentTime, 1.3, 1, 0, duration);
      }
      else
      {
        this.#arrow.scale = Interpolation.valueAt(loopCurrentTime, 1.3, 1, 0, duration, EasingFunction.Out);
      }
    }
  }

  override dispose(isDisposing: boolean = true)
  {
    super.dispose(isDisposing);

    if (this.drawableRepeat)
      this.drawableRepeat.hitObjectApplied.removeListener(this.#onHitObjectApplied, this);
  }
}
