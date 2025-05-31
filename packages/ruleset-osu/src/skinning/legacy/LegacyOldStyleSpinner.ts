import type { ReadonlyDependencyContainer } from "@osucad/framework";
import { Axes, Container } from "@osucad/framework";
import { Anchor, DrawableSprite, Vec2 } from "@osucad/framework";
import { LegacySpinner } from "./LegacySpinner";
import type { ArmedState, DrawableHitObject } from "@osucad/core";
import { ISkinSource } from "@osucad/core";
import { Color } from "pixi.js";
import { DrawableSpinner } from "../../hitObjects/drawables/DrawableSpinner";

export class LegacyOldStyleSpinner extends  LegacySpinner
{
  #disc!: DrawableSprite;
  #metreSprite!: DrawableSprite;
  #metre!: Container;

  #spinnerBlink = false;

  static readonly final_metre_height = 692 * this.SPRITE_SCALE;
  static readonly total_bars = 10;

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    const source = dependencies.resolve(ISkinSource);

    this.addRangeInternal([
      new DrawableSprite({
        anchor: Anchor.TopCenter,
        origin: Anchor.Center,
        texture: source.getTexture("spinner-background"),
        color: source.getConfig("spinnerBackground") ?? new Color("rgba(100, 100, 100, 255)"),
        scale: new Vec2(LegacySpinner.SPRITE_SCALE),
        y: LegacySpinner.SPINNER_Y_CENTRE,
      }),
      this.#disc = new DrawableSprite({
        anchor: Anchor.TopCenter,
        origin: Anchor.Center,
        texture: source.getTexture("spinner-circle"),
        scale: new Vec2(LegacySpinner.SPRITE_SCALE),
        y: LegacySpinner.SPINNER_Y_CENTRE,
      }),
      this.#metre = new Container({
        autoSizeAxes : Axes.Both,
        // this anchor makes no sense, but that's what stable uses.
        anchor : Anchor.TopLeft,
        origin : Anchor.TopLeft,
        margin : { top: LegacySpinner.SPINNER_TOP_OFFSET },
        masking : true,
        child : this.#metreSprite = new DrawableSprite({
          texture : source.getTexture("spinner-metre"),
          anchor : Anchor.TopLeft,
          origin : Anchor.TopLeft,
          scale : new Vec2(LegacySpinner.SPRITE_SCALE),
        }),
      }),
      this.approachCircle = new DrawableSprite({
        anchor : Anchor.TopCenter,
        origin : Anchor.Center,
        texture : source.getTexture("spinner-approachcircle"),
        scale : new Vec2(LegacySpinner.SPRITE_SCALE * 1.86),
        y : LegacySpinner.SPINNER_Y_CENTRE,
      }),
    ]);
  }

  protected override updateStateTransforms(drawableHitObject: DrawableHitObject, state: ArmedState)
  {
    super.updateStateTransforms(drawableHitObject, state);

    if (!(drawableHitObject instanceof DrawableSpinner))
      return;

    const spinner = drawableHitObject.hitObject;

    this.absoluteSequence(spinner.startTime - spinner.timePreempt, () =>
      this.fadeOut(),
    );

    this.absoluteSequence(spinner.startTime - spinner.timeFadeIn, () =>
      this.fadeIn(spinner.timeFadeIn),
    );
  }

  override update()
  {
    super.update();

    this.#disc.rotation = this.drawableSpinner.rotationTracker.rotation;

    const metreHeight = this.#getMetreHeight(this.drawableSpinner.progress);

    this.#metre.y = LegacyOldStyleSpinner.final_metre_height - metreHeight;
    this.#metreSprite.y = -this.#metre.y;
  }

  #getMetreHeight(progress: number)
  {
    progress *= 100;

    // the spinner should still blink at 100% progress.
    if (this.#spinnerBlink)
      progress = Math.min(99, progress);

    let barCount = Math.floor(progress / 10);



    if (this.#spinnerBlink && Math.random() < Math.floor(progress % 10) / 10)
      barCount++;

    return barCount / LegacyOldStyleSpinner.total_bars * LegacyOldStyleSpinner.final_metre_height;
  }
}
