import {
  Anchor,
  Axes, clamp,
  CompositeDrawable,
  dependencyLoader,
  Drawable,
  DrawableSprite,
  PIXIContainer,
  resolved,
} from 'osucad-framework';
import { Mesh, QuadGeometry } from 'pixi.js';
import { DrawableHitObject } from '../../editor/hitobjects/DrawableHitObject';
import type { DrawableSlider } from '../../editor/hitobjects/DrawableSlider';
import { ISkinSource } from '../ISkinSource';
import { SliderBallShader } from './SliderBallShader';

export class StableSliderBall extends CompositeDrawable {
  @resolved(ISkinSource)
  private skin!: ISkinSource;

  @dependencyLoader()
  load() {
    this.relativeSizeAxes = Axes.Both;

    this.addAllInternal(
      new MainSliderBall(),
      this.#specular = new DrawableSprite({
        texture: this.skin.getTexture('sliderb-spec'),
        relativeSizeAxes: Axes.Both,
        blendMode: 'add',
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
    );
  }

  #specular!: DrawableSprite;

  updateAfterChildren() {
    super.updateAfterChildren();

    this.#specular.rotation = -this.parent!.rotation;
  }

  @resolved(DrawableHitObject)
  private drawableHitObject!: DrawableSlider;

  protected loadComplete() {
    super.loadComplete();

    this.drawableHitObject.applyCustomUpdateState.addListener(this.#updateStateTransforms, this);
    this.#updateStateTransforms();
  }

  #updateStateTransforms() {
    const slider = this.drawableHitObject.hitObject!;

    this.absoluteSequence(slider.startTime, () => this.fadeIn())
    this.absoluteSequence(slider.endTime, () => this.fadeOut())
  }

  dispose(isDisposing?: boolean) {
    super.dispose(isDisposing);

    this.drawableHitObject.applyCustomUpdateState.removeListener(this.#updateStateTransforms);
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

    const distance = slider.path.expectedDistance * slider.progressAt(completionProgress);

    const radius = slider.radius;

    this.#shader.angle = distance / radius * 1.25;
  }
}
