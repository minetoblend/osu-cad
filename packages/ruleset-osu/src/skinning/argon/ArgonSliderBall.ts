import type { ReadonlyDependencyContainer } from '@osucad/framework';
import { DrawableHitObject } from '@osucad/core';
import { Anchor, Axes, Bindable, Box, CircularContainer, ColorUtils, CompositeDrawable, Container, DrawableSprite, EasingFunction, resolved, Vec2 } from '@osucad/framework';

import { getIcon } from '@osucad/resources';
import { DrawableSlider } from '@osucad/ruleset-osu';
import { Color } from 'pixi.js';
import { ArgonMainCirclePiece } from './ArgonMainCirclePiece';

const defaultIconScale = new Vec2(0.6, 0.8);

export class ArgonSliderBall extends CompositeDrawable {
  readonly #fill: Box;
  readonly #icon: DrawableSprite;

  private readonly accentColor = new Bindable(new Color('white'));

  @resolved(DrawableHitObject, true)
  private parentObject?: DrawableHitObject;

  constructor() {
    super();

    this.size = new Vec2(ArgonMainCirclePiece.OUTER_GRADIENT_SIZE);

    this.internalChildren = [
      new CircularContainer({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        masking: true,
        child: new Box({ relativeSizeAxes: Axes.Both }),
      }),
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: ArgonMainCirclePiece.GRADIENT_THICKNESS,
        child: new CircularContainer({
          relativeSizeAxes: Axes.Both,
          masking: true,
          child: this.#fill = new Box({
            relativeSizeAxes: Axes.Both,
            anchor: Anchor.Center,
            origin: Anchor.Center,
          }),
        }),
      }),
      this.#icon = new DrawableSprite({
        texture: getIcon('caret-left'),
        size: 54,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        rotation: Math.PI,
      }),
    ];
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    if (this.parentObject)
      this.accentColor.bindTo(this.parentObject.accentColor);
  }

  protected override loadComplete() {
    super.loadComplete();

    this.accentColor.bindValueChanged((color) => {
      this.#fill.color = ColorUtils.darkenSimple(color.value, 0.5);
    }, true);

    if (this.parentObject) {
      this.parentObject.applyCustomUpdateState.addListener(this.#updateStateTransforms, this);
      this.#updateStateTransforms(this.parentObject);
    }
  }

  #updateStateTransforms(drawableObject: DrawableHitObject) {
    if (!(drawableObject instanceof DrawableSlider))
      return;

    const duration = 200;
    const icon_scale = 0.9;

    this.absoluteSequence({ time: drawableObject.stateUpdateTime, recursive: true }, () => {
      this.fadeInFromZero(duration, EasingFunction.OutQuint);
      this.#icon.scaleTo(0).then().scaleTo(defaultIconScale, duration, EasingFunction.OutElasticHalf);
    });

    this.absoluteSequence({ time: drawableObject.hitStateUpdateTime, recursive: true }, () => {
      this.fadeOut(duration / 4, EasingFunction.OutQuint);
      this.#icon.scaleTo(0).then().scaleTo(defaultIconScale, duration, EasingFunction.OutElasticHalf);
    });
  }

  override update() {
    super.update();

    const appliedRotation = this.parent!.rotation;

    // this.#fill.rotation = -appliedRotation;
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    if (this.parentObject)
      this.parentObject.applyCustomUpdateState.removeListener(this.#updateStateTransforms, this);
  }
}
