import { DrawableHitObject, ISkinSource, SkinnableTextureAnimation } from "@osucad/core";
import type { Drawable, ReadonlyDependencyContainer } from "@osucad/framework";
import { Anchor, Axes, Bindable, CompositeDrawable, DrawableSprite, resolved } from "@osucad/framework";
import { computed, watch, withEffectScope } from "@osucad/framework";
import { Color } from "pixi.js";
import { DrawableSlider } from "../../hitObjects/drawables/DrawableSlider";
import { OsuHitObject } from "../../hitObjects";

export class LegacySliderBall extends CompositeDrawable
{
  public constructor(public readonly sliderb: Drawable | null)
  {
    super();
  }

  @resolved(ISkinSource)
  accessor #skin!: ISkinSource;

  @resolved(DrawableHitObject)
  accessor #drawableHitObject!: DrawableHitObject;

  public sliderBall!: Drawable;

  #specular!: Drawable;

  readonly #allowSliderBallTint = computed(() => this.#skin.getConfig("allowSliderBallTint"));

  public readonly accentColor = new Bindable<Color>(new Color(0xFFFFFF));

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.relativeSizeAxes = Axes.Both;

    if (this.sliderb instanceof SkinnableTextureAnimation || (this.sliderb instanceof DrawableSprite && this.sliderb.texture))
    {
      this.internalChildren = [
        new DrawableSprite({
          anchor: Anchor.Center,
          origin: Anchor.Center,
          texture: this.#skin.getTexture("sliderb-nd")?.withMaximumSize(OsuHitObject.OBJECT_DIMENSIONS.scale(3)),
          color: 0x050505,
        }),
        this.sliderBall = this.sliderb.with({
          anchor: Anchor.Center,
          origin: Anchor.Center,
        }),
        this.#specular = new DrawableSprite({
          texture: this.#skin.getTexture("sliderb-spec"),
          relativeSizeAxes: Axes.Both,
          blendMode: "add",
          anchor: Anchor.Center,
          origin: Anchor.Center,
        }),
      ];
    }
  }

  @withEffectScope()
  protected override loadComplete()
  {
    super.loadComplete();

    watch(this.#allowSliderBallTint, () => this.#updateColors());

    this.accentColor.bindValueChanged(this.#updateColors, this, true);

    this.alwaysPresent = true;

    this.#drawableHitObject.applyCustomUpdateState.addListener(this.#updateStateTransforms, this);
    this.#updateStateTransforms(this.#drawableHitObject);
  }

  #updateColors()
  {
    if (this.sliderBall)
      this.sliderBall.color = this.#allowSliderBallTint.value ? this.#drawableHitObject.accentColor.value : 0xFFFFFF;
  }

  #updateStateTransforms(drawableObject: DrawableHitObject)
  {
    if (!(drawableObject instanceof DrawableSlider))
      return;

    this.applyTransformsAt(-Number.MAX_VALUE, true);
    this.clearTransformsAfter(-Number.MAX_VALUE, true);

    const slider = drawableObject.hitObject;

    this.absoluteSequence(slider.startTime, () => this.fadeInFromZero());
    this.absoluteSequence(slider.endTime, () => this.fadeOutFromOne());
  }

  protected override updateAfterChildren()
  {
    super.updateAfterChildren();

    if (this.#specular)
      this.#specular.rotation = -this.parent!.rotation;
  }

  public override dispose()
  {
    this.#drawableHitObject.applyCustomUpdateState.removeListener(this.#updateStateTransforms, this);

    super.dispose();
  }
}
