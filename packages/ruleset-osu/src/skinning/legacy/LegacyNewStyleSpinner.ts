import type { ReadonlyDependencyContainer } from "@osucad/framework";
import { Anchor, Axes, Container, DrawableSprite, EasingFunction, Vec2 } from "@osucad/framework";
import { LegacySpinner } from "./LegacySpinner";
import type { DrawableHitObject } from "@osucad/core";
import { ArmedState, ISkinSource } from "@osucad/core";
import { Color } from "pixi.js";
import { DrawableSpinner } from "../../hitObjects/drawables/DrawableSpinner";
import { DrawableSpinnerBonusTick } from "../../hitObjects/drawables/DrawableSpinnerBonusTick";

export class LegacyNewStyleSpinner extends LegacySpinner
{
  #scaleContainer!: Container;
  #glow!: DrawableSprite;
  #discBottom!: DrawableSprite;
  #discTop!: DrawableSprite;
  #spinningMiddle!: DrawableSprite;
  #fixedMiddle!: DrawableSprite;

  readonly #glowColor = new Color("rgba(3, 151, 255, 255)");


  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    const source = dependencies.resolve(ISkinSource);

    this.addInternal(this.#scaleContainer = new Container({
      scale: new Vec2(LegacySpinner.SPRITE_SCALE),
      anchor: Anchor.TopCenter,
      origin: Anchor.Center,
      relativeSizeAxes: Axes.Both,
      y: LegacySpinner.SPINNER_Y_CENTRE,
      children: [
        this.#glow = new DrawableSprite({
          anchor: Anchor.Center,
          origin: Anchor.Center,
          texture: source.getTexture("spinner-glow"),
          blendMode: "add",
          color: this.#glowColor,
        }),
        this.#discBottom = new DrawableSprite({
          anchor : Anchor.Center,
          origin : Anchor.Center,
          texture : source.getTexture("spinner-bottom"),
        }),
        this.#discTop = new DrawableSprite({
          anchor : Anchor.Center,
          origin : Anchor.Center,
          texture : source.getTexture("spinner-top"),
        }),
        this.#spinningMiddle = new DrawableSprite({
          anchor : Anchor.Center,
          origin : Anchor.Center,
          texture : source.getTexture("spinner-middle2"),
        }),
        this.#fixedMiddle = new DrawableSprite({
          anchor : Anchor.Center,
          origin : Anchor.Center,
          texture : source.getTexture("spinner-middle"),
        }),
      ],
    }));

    // TODO:
    // const topProvider = source.findProvider(s => s.getTexture("spinner-top") !== null);
    // if (topProvider instanceof SkinTransformer && !(topProvider.skin instanceof DefaultLegacySkin))
    // {
    // ...
    // }
  }

  protected override updateStateTransforms(drawableHitObject: DrawableHitObject, state: ArmedState)
  {
    super.updateStateTransforms(drawableHitObject, state);

    if (drawableHitObject instanceof DrawableSpinner)
    {
      const spinner = drawableHitObject.hitObject;

      this.absoluteSequence(spinner.startTime - spinner.timePreempt, () =>
        this.fadeOut(),
      );

      this.absoluteSequence(spinner.startTime - spinner.timeFadeIn, () =>
        this.fadeIn(spinner.timeFadeIn),
      );

      this.absoluteSequence(spinner.startTime - spinner.timePreempt, () =>
      {
        this.#fixedMiddle.fadeColor(0xffffff);

        const s =this.beginDelayedSequence(spinner.timePreempt);
        this.#fixedMiddle.fadeColor("red", spinner.duration);
        s.dispose();
      });

      if (state === ArmedState.Hit)
      {
        this.absoluteSequence(drawableHitObject.hitStateUpdateTime, () =>
          this.#glow.fadeOut(300),
        );
      }
    }

    if (drawableHitObject instanceof DrawableSpinnerBonusTick)
    {
      if (state === ArmedState.Hit)
        this.#glow.flashColorTo(0xffffff, 200);
    }
  }

  override update()
  {
    super.update();

    const turnRatio = this.#spinningMiddle.texture !== null ? 0.5 : 1;
    this.#discTop.rotation = this.drawableSpinner.rotationTracker.rotation * turnRatio;
    this.#spinningMiddle.rotation = this.drawableSpinner.rotationTracker.rotation;

    this.#discBottom.rotation = this.#discTop.rotation / 3;

    this.#glow.alpha = this.drawableSpinner.progress;

    this.#scaleContainer.scale = new Vec2(LegacySpinner.SPRITE_SCALE * (0.8 + EasingFunction.Out(this.drawableSpinner.progress) * 0.2));
  }
}
