import type { DrawableOptions, ReadonlyDependencyContainer } from '@osucad/framework';
import type { DrawableOsuHitObject } from '@osucad/ruleset-osu';
import { ArmedState, BetterGlowFilter, DrawableHitObject } from '@osucad/core';
import { Anchor, Axes, Bindable, BindableBoolean, Box, CircularContainer, ColorUtils, CompositeDrawable, EasingFunction, resolved, Vec2 } from '@osucad/framework';
import { Color } from 'pixi.js';
import { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { DefaultComboNumber } from '../default/DefaultComboNumber';
import { RingPiece } from '../default/RingPiece';

export class ArgonMainCirclePiece extends CompositeDrawable {
  static readonly BORDER_THICKNESS = (OsuHitObject.object_radius * 2) * (2 / 58);

  static readonly GRADIENT_THICKNESS = this.BORDER_THICKNESS * 2.5;

  static readonly OUTER_GRADIENT_SIZE = (OsuHitObject.object_radius * 2) - this.BORDER_THICKNESS * 4;

  static readonly INNER_GRADIENT_SIZE = this.OUTER_GRADIENT_SIZE - this.GRADIENT_THICKNESS * 2;
  static readonly INNER_FILL_SIZE = this.INNER_GRADIENT_SIZE - this.GRADIENT_THICKNESS * 2;

  private readonly outerFill: Circle;
  private readonly outerGradient: Circle;
  private readonly innerGradient: Circle;
  private readonly innerFill: Circle;

  private readonly border: RingPiece;
  private readonly number: DefaultComboNumber;

  private readonly accentColor = new Bindable<Color>(null!);
  private readonly indexInCurrentCombo = new Bindable<number>(0);
  private readonly flash: FlashPiece;

  @resolved(DrawableHitObject)
  drawableObject!: DrawableHitObject;

  private readonly configHigLighting = new BindableBoolean();

  constructor(withOuterFill: boolean) {
    super();

    const circle_size = OsuHitObject.object_dimensions;

    this.size = circle_size;

    this.anchor = Anchor.Center;
    this.origin = Anchor.Center;

    this.internalChildren = [
      this.outerFill = new Circle({
        anchor: Anchor.Center,
        origin: Anchor.Center,
        // Slightly inset to prevent bleeding outside the ring
        size: circle_size.sub(Vec2.one()),
        alpha: withOuterFill ? 1 : 0,
      }),
      this.outerGradient = new Circle({
        size: ArgonMainCirclePiece.OUTER_GRADIENT_SIZE,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
      this.innerGradient = new Circle({
        size: ArgonMainCirclePiece.INNER_GRADIENT_SIZE,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
      this.innerFill = new Circle({
        size: ArgonMainCirclePiece.INNER_FILL_SIZE,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
      this.number = new DefaultComboNumber(),
      this.flash = new FlashPiece(),
      this.border = new RingPiece(ArgonMainCirclePiece.BORDER_THICKNESS),
    ];
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const drawableOsuObject = this.drawableObject as DrawableOsuHitObject;

    this.accentColor.bindTo(this.drawableObject.accentColor);
    this.indexInCurrentCombo.bindTo(drawableOsuObject.indexInComboBindable);
  }

  protected override loadComplete() {
    super.loadComplete();

    this.accentColor.bindValueChanged((color) => {
      this.outerGradient.clearTransforms(false, 'color');
      this.outerGradient.color = color.value;

      this.outerFill.color = this.innerFill.color = ColorUtils.darkenSimple(color.value, 4);
      this.innerGradient.color = ColorUtils.darkenSimple(color.value, 0.5);
      this.flash.color = color.value;

      this.scheduler.addOnce(this.#applyTransforms, this);
    }, true);

    this.drawableObject.applyCustomUpdateState.addListener(this.#updateStateTransforms, this);
  }

  #applyTransforms() {
    this.applyTransformsAt(-Number.MAX_VALUE, true);
    this.clearTransformsAfter(-Number.MAX_VALUE, true);

    this.#updateStateTransforms(this.drawableObject, this.drawableObject.state.value);
  }

  #updateStateTransforms(drawableObject: DrawableHitObject, state: ArmedState = this.drawableObject.state.value) {
    this.absoluteSequence({ time: drawableObject.stateUpdateTime, recursive: true }, () => {
      switch (state) {
        case ArmedState.Hit: {
          const fade_out_time = 800;
          const flash_in_duration = 150;
          const resize_duration = 400;

          const shrink_size = 0.8;

          this.number.fadeOut(flash_in_duration / 2);

          this.outerFill.fadeOut(flash_in_duration, EasingFunction.OutQuint);
          this.innerFill.fadeOut(flash_in_duration, EasingFunction.OutQuint);

          this.innerGradient.fadeOut(flash_in_duration, EasingFunction.OutQuint);

          this.border.fadeColor(
            new Color(this.accentColor.value).setAlpha(0.5),
            fade_out_time,
          );

          // The outer ring shrinks immediately, but accounts for its thickness so it doesn't overlap the inner
          // gradient layers.
          this.border.resizeTo(this.size.scale(shrink_size).addF(ArgonMainCirclePiece.BORDER_THICKNESS), resize_duration, EasingFunction.OutElasticHalf);

          const seq = this.beginDelayedSequence(flash_in_duration / 12);

          this.outerGradient.resizeTo(ArgonMainCirclePiece.OUTER_GRADIENT_SIZE * shrink_size, resize_duration, EasingFunction.OutElasticHalf);

          this.outerGradient
            .fadeColor(0xFFFFFF, 80)
            .then()
            .fadeOut(flash_in_duration);

          seq.dispose();

          if (this.configHigLighting.value) {
            this.flash.hitLighting = true;
            this.flash.fadeTo(1, flash_in_duration, EasingFunction.OutQuint);

            this.fadeOut(fade_out_time, EasingFunction.OutQuad);
          }
          else {
            this.flash.hitLighting = false;
            this.flash.fadeTo(1, flash_in_duration, EasingFunction.OutQuint)
              .then()
              .fadeOut(flash_in_duration, EasingFunction.OutQuint);

            this.fadeOut(fade_out_time * 0.8, EasingFunction.OutQuad);
          }

          break;
        }
      }
    });
  }

  override update() {
    super.update();

    const parent = this.findClosestParent(it => it.rotation !== 0);
    this.number.rotation = -(parent?.rotation ?? 0);
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.drawableObject.applyCustomUpdateState.removeListener(this.#updateStateTransforms, this);
  }
}

class Circle extends CircularContainer {
  constructor(options: DrawableOptions = {}) {
    super();

    this.masking = true;

    this.internalChild = new Box({ relativeSizeAxes: Axes.Both });

    this.with(options);
  }
}

class FlashPiece extends Circle {
  constructor() {
    super();

    this.size = new Vec2(OsuHitObject.object_radius);
    this.anchor = Anchor.Center;
    this.origin = Anchor.Center;

    this.alpha = 0;
    this.blendMode = 'add';

    this.filters = [
      this.#glow = new BetterGlowFilter({
        radius: 0,
        alpha: 0.5,
        color: 0xFFFFFF,
        drawOriginal: false,
      }),
    ];
  }

  hitLighting = false;

  readonly #glow: BetterGlowFilter;

  override update() {
    super.update();

    this.#glow.color = this.color;
    this.#glow.radius = OsuHitObject.object_radius * (this.hitLighting ? 1.2 : 0.6) * 0.5;
  }
}
