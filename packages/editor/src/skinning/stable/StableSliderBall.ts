import type { DrawableSlider } from '../../editor/hitobjects/DrawableSlider';
import {
  Anchor,
  Axes,
  Bindable,
  clamp,
  CompositeDrawable,
  dependencyLoader,
  Drawable,
  DrawableSprite,
  PIXIContainer,
  resolved,
} from 'osucad-framework';
import { Color, Mesh, QuadGeometry } from 'pixi.js';
import { DrawableHitObject } from '../../editor/hitobjects/DrawableHitObject';
import { SkinnableTextureAnimation } from '../DrawableAnimation.ts';
import { ISkinSource } from '../ISkinSource';
import { SkinConfig } from '../SkinConfig.ts';
import { SliderBallShader } from './SliderBallShader';

export class StableSliderBall extends CompositeDrawable {
  constructor(readonly sliderb: Drawable | null) {
    super();
  }

  @resolved(ISkinSource)
  private skin!: ISkinSource;

  allowSliderBallTint = false;

  sliderBall!: Drawable;

  accentColor = new Bindable<Color>(new Color(0xFFFFFF));

  @dependencyLoader()
  load() {
    this.relativeSizeAxes = Axes.Both;

    if (this.sliderb instanceof SkinnableTextureAnimation || (this.sliderb instanceof DrawableSprite && this.sliderb.texture)) {
      this.addInternal(this.sliderBall = this.sliderb.with({
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }));
    }
    else {
      this.addAllInternal(
        this.sliderBall = new MainSliderBall(),
        this.#specular = new DrawableSprite({
          texture: this.skin.getTexture('sliderb-spec'),
          relativeSizeAxes: Axes.Both,
          blendMode: 'add',
          anchor: Anchor.Center,
          origin: Anchor.Center,
        }),
      );
    }

    this.accentColor.valueChanged.addListener(this.#updateColors, this);

    this.skin.sourceChanged.addListener(this.#skinChanged, this);
    this.#skinChanged();
  }

  #skinChanged() {
    this.allowSliderBallTint = this.skin.getConfig(SkinConfig.AllowSliderBallTint)?.value ?? false;

    this.#updateColors();
  }

  #updateColors() {
    this.sliderBall.color = this.allowSliderBallTint ? this.drawableHitObject.accentColor.value : 0xFFFFFF;
  }

  #specular: DrawableSprite | null = null;

  updateAfterChildren() {
    super.updateAfterChildren();

    if (this.#specular)
      this.#specular.rotation = -this.parent!.rotation;
  }

  @resolved(DrawableHitObject)
  private drawableHitObject!: DrawableSlider;

  protected loadComplete() {
    super.loadComplete();

    this.drawableHitObject.applyCustomUpdateState.addListener(this.#updateStateTransforms, this);
    this.#updateStateTransforms();

    this.accentColor.bindTo(this.drawableHitObject.accentColor);
    this.#updateColors();
  }

  #updateStateTransforms() {
    this.clearTransformsAfter(Number.MIN_VALUE);

    const slider = this.drawableHitObject.hitObject!;

    this.absoluteSequence(slider.startTime, () => this.fadeIn());
    this.absoluteSequence(slider.endTime, () => this.fadeOut());
  }

  dispose(isDisposing?: boolean) {
    super.dispose(isDisposing);

    this.drawableHitObject.applyCustomUpdateState.removeListener(this.#updateStateTransforms, this);

    this.skin.sourceChanged.removeListener(this.#skinChanged, this);
  }
}

export class MainSliderBall extends Drawable {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  readonly #shader = new SliderBallShader();

  readonly #mesh = new Mesh({
    geometry: new QuadGeometry(),
    shader: this.#shader,
  });

  createDrawNode(): PIXIContainer {
    return new PIXIContainer({
      children: [this.#mesh],
    });
  }

  updateDrawNodeTransform() {
    super.updateDrawNodeTransform();

    this.#mesh.scale.copyFrom(this.drawSize);
  }

  @resolved(DrawableHitObject)
  private drawableHitObject!: DrawableSlider;

  update() {
    super.update();

    const slider = this.drawableHitObject.hitObject!;

    const completionProgress = clamp((this.time.current - this.drawableHitObject.hitObject!.startTime) / this.drawableHitObject.hitObject!.duration, 0, 1);

    let distance = slider.path.expectedDistance * slider.progressAt(completionProgress);

    const spanDuration = slider.spanDuration;
    const spanIndex = Math.floor((this.time.current - slider.startTime) / spanDuration);

    if (spanIndex % 2 === 1) {
      distance = slider.path.expectedDistance - distance;
    }

    const radius = slider.radius;

    this.#shader.angle = distance / radius * 1.25;
  }
}
