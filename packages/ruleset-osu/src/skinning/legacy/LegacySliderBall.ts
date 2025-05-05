import { DrawableHitObject, ISkinSource, SkinnableTextureAnimation } from "@osucad/core";
import { Anchor, Axes, Bindable, CompositeDrawable, Drawable, DrawableSprite, ReadonlyDependencyContainer, resolved } from "@osucad/framework";
import { Color } from "pixi.js";

export class LegacySliderBall extends CompositeDrawable {
  constructor(readonly sliderb: Drawable | null) {
    super();
  }

  @resolved(ISkinSource)
  private skin!: ISkinSource;

  @resolved(DrawableHitObject)
  drawableHitObject!: DrawableHitObject

  allowSliderBallTint!: Bindable<boolean | null>;

  sliderBall!: Drawable;

  #specular!: Drawable;

  readonly accentColor = new Bindable<Color>(new Color(0xFFFFFF));

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.relativeSizeAxes = Axes.Both;

    this.allowSliderBallTint = this.skin.getConfigBindable('allowSliderBallTint')

    if (this.sliderb instanceof SkinnableTextureAnimation || (this.sliderb instanceof DrawableSprite && this.sliderb.texture)) {
      this.internalChildren = [
        this.sliderBall = this.sliderb.with({
          anchor: Anchor.Center,
          origin: Anchor.Center,
        }),
        this.#specular = new DrawableSprite({
          texture: this.skin.getTexture('sliderb-spec'),
          relativeSizeAxes: Axes.Both,
          blendMode: 'add',
          anchor: Anchor.Center,
          origin: Anchor.Center,
        }),
      ]
    }
  }

  protected override loadComplete() {
    super.loadComplete();

    this.allowSliderBallTint.bindValueChanged(this.#updateColors, this);
    this.accentColor.valueChanged.addListener(this.#updateColors, this, true);

    this.drawableHitObject.applyCustomUpdateState.addListener(this.#updateStateTransforms, this)
  }

  #updateColors() {
    this.sliderBall.color = this.allowSliderBallTint.value ? this.drawableHitObject.accentColor.value : 0xFFFFFF;
  }

  #updateStateTransforms(drawableObject: DrawableHitObject) {
    this.clearTransformsAfter(-Number.MAX_VALUE);

    const slider = drawableObject.hitObject;

    this.absoluteSequence(slider.startTime, () => this.fadeIn());
    this.absoluteSequence(slider.endTime, () => this.fadeOut());
  }

  public override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.drawableHitObject.applyCustomUpdateState.removeListener(this.#updateStateTransforms, this)
  }

  public override updateAfterChildren() {
    super.updateAfterChildren();

    if (this.#specular)
      this.#specular.rotation = -this.parent!.rotation;
  }
}