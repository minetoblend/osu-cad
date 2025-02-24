import type { Bindable, ReadonlyDependencyContainer } from '@osucad/framework';
import type { Color } from 'pixi.js';
import type { DrawableSliderRepeat } from '../../hitObjects/drawables/DrawableSliderRepeat';
import { ArmedState, DrawableHitObject, ISkinSource } from '@osucad/core';
import { Anchor, Axes, ColorUtils, CompositeDrawable, Container, DrawableSprite, EasingFunction, FastRoundedBox, Interpolation, resolved, Vec2 } from '@osucad/framework';
import { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { ArgonMainCirclePiece } from './ArgonMainCirclePiece';

export class ArgonReverseArrow extends CompositeDrawable {
  @resolved(DrawableHitObject)
  private drawableRepeat!: DrawableSliderRepeat;

  private accentColor!: Bindable<Color>;

  private icon!: DrawableSprite;
  private main!: Container;
  private side!: DrawableSprite;

  @resolved(ISkinSource)
  private skin!: ISkinSource;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.anchor = Anchor.Center;
    this.origin = Anchor.Center;

    this.size = OsuHitObject.object_dimensions;

    this.internalChildren = [
      this.main = new Container({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        children: [
          new FastRoundedBox({
            size: new Vec2(40, 20),
            anchor: Anchor.Center,
            origin: Anchor.Center,
            cornerRadius: 100,
          }),
          this.icon = new DrawableSprite({

          }),
        ],
      }),
      this.side = new DrawableSprite({
        texture: this.skin.getTexture('repeat-edge-piece'),
        anchor: Anchor.Center,
        origin: Anchor.Center,
        size: ArgonMainCirclePiece.OUTER_GRADIENT_SIZE,
      }),
    ];

    this.accentColor = this.drawableRepeat.accentColor.getBoundCopy();
    this.accentColor.bindValueChanged(accent => this.icon.color = ColorUtils.darkenSimple(accent.value, 4), true);
  }

  override update() {
    super.update();

    if (this.time.current >= this.drawableRepeat.hitStateUpdateTime && this.drawableRepeat.state.value === ArmedState.Hit) {
      const animDuration = Math.min(300, this.drawableRepeat.hitObject!.spanDuration);
      this.scale = new Vec2(Interpolation.valueAt(this.time.current, 1, 1.5, this.drawableRepeat.hitStateUpdateTime, this.drawableRepeat.hitStateUpdateTime + animDuration, EasingFunction.Out));
    }
    else {
      this.scale = Vec2.one();
    }

    const move_distance = -12;
    const scale_amount = 1.3;

    const move_out_duration = 35;
    const move_in_duration = 250;
    const total = 300;

    const loopCurrentTime = (this.time.current - this.drawableRepeat.animationStartTime.value) % total;

    if (loopCurrentTime < move_out_duration)
      this.main.scale = new Vec2(Interpolation.valueAt(loopCurrentTime, 1, scale_amount, 0, move_out_duration, EasingFunction.Out));
    else
      this.main.scale = new Vec2(Interpolation.valueAt(loopCurrentTime, scale_amount, 1, move_out_duration, move_out_duration + move_in_duration, EasingFunction.Out));

    if (loopCurrentTime < move_out_duration)
      this.side.x = Interpolation.valueAt(loopCurrentTime, 0, move_distance, 0, move_out_duration, EasingFunction.Out);
    else
      this.side.x = Interpolation.valueAt(loopCurrentTime, move_distance, 0, move_out_duration, move_out_duration + move_in_duration, EasingFunction.Out);
  }
}
