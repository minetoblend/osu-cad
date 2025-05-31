import type { Drawable, ReadonlyDependencyContainer, ValueChangedEvent } from "@osucad/framework";
import { Anchor, Axes, Bindable, CompositeDrawable, Container, DrawableSprite, EasingFunction, Vec2 } from "@osucad/framework";
import { DrawableSpinner } from "../../hitObjects/drawables/DrawableSpinner";
import { ArmedState, DrawableHitObject, ISkinSource } from "@osucad/core";
import { DrawableSpinnerTick } from "../../hitObjects/drawables/DrawableSpinnerTick";
import { LegacyFont } from "../../LegacyFont";
import { LegacySpriteText } from "../../LegacySpriteText";

export abstract class LegacySpinner extends CompositeDrawable
{
  public static readonly SPRITE_SCALE = 0.625;

  protected static readonly SPINNER_TOP_OFFSET = 45 - 16;

  protected static readonly SPINNER_Y_CENTRE = this.SPINNER_TOP_OFFSET + 219;

  private static readonly spm_hide_offset = 50;

  protected drawableSpinner!: DrawableSpinner;

  public approachCircle: Drawable | null = null;

  #spin!: DrawableSprite;
  #clear!: DrawableSprite;
  #bonusCounter!: LegacySpriteText;
  #spmBackground!: DrawableSprite;
  #spmCounter!: LegacySpriteText;

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);

    this.anchor = Anchor.Center;
    this.origin = Anchor.Center;

    this.size = new Vec2(640, 480);
    this.position = new Vec2(0, -8);

    this.drawableSpinner = dependencies.resolve(DrawableHitObject) as DrawableSpinner;
    const source = dependencies.resolve(ISkinSource);


    this.addInternal(new Container({
      depth: -Number.MAX_VALUE,
      relativeSizeAxes: Axes.Both,
      children: [
        this.#spin = new DrawableSprite({
          alpha: 0,
          anchor: Anchor.TopCenter,
          origin: Anchor.Center,
          texture: source.getTexture("spinner-spin"),
          scale: new Vec2(LegacySpinner.SPRITE_SCALE),
          y: LegacySpinner.SPINNER_TOP_OFFSET + 335,
        }),
        this.#clear = new DrawableSprite({
          alpha: 0,
          anchor: Anchor.TopCenter,
          origin: Anchor.Center,
          texture: source.getTexture("spinner-clear"),
          scale: new Vec2(LegacySpinner.SPRITE_SCALE),
          y: LegacySpinner.SPINNER_TOP_OFFSET + 115,
        }),
        this.#bonusCounter = new LegacySpriteText({
          font: LegacyFont.Score,
          alpha: 0,
          anchor: Anchor.TopCenter,
          origin: Anchor.Center,
          scale: new Vec2(LegacySpinner.SPRITE_SCALE),
          y: LegacySpinner.SPINNER_TOP_OFFSET + 299,
        }),
        this.#spmBackground = new DrawableSprite({
          anchor: Anchor.TopCenter,
          origin: Anchor.TopLeft,
          texture: source.getTexture("spinner-rpm"),
          scale: new Vec2(LegacySpinner.SPRITE_SCALE),
          position: new Vec2(-87, 445 + LegacySpinner.spm_hide_offset),
        }),
        this.#spmCounter = new LegacySpriteText({
          font: LegacyFont.Score,
          anchor: Anchor.TopCenter,
          origin: Anchor.TopRight,
          scale: new Vec2(LegacySpinner.SPRITE_SCALE * 0.9),
          position: new Vec2(80, 448 + LegacySpinner.spm_hide_offset),
        }),
      ],
    }));
  }

  private completedSpins: Bindable<number> = null!;
  private spinsPerMinute: Bindable<number> = null!;

  readonly #completed = new Bindable(false);

  protected override loadComplete()
  {
    super.loadComplete();

    this.completedSpins = this.drawableSpinner.completedFullSpins.getBoundCopy();
    this.completedSpins.bindValueChanged(bonus =>
    {
      if (this.drawableSpinner.currentBonusScore <= 0)
        return;

      this.#bonusCounter.text = this.drawableSpinner.currentBonusScore.toString();

      if (this.drawableSpinner.currentBonusScore === this.drawableSpinner.maximumBonusScore)
      {
        this.#bonusCounter.scaleTo(1.4).then().scaleTo(1.8, 1000, EasingFunction.Out);
        this.#bonusCounter.fadeOutFromOne(500, EasingFunction.Out);
      }
      else
      {
        this.#bonusCounter.fadeOutFromOne(800, EasingFunction.Out);
        this.#bonusCounter.scaleTo(LegacySpinner.SPRITE_SCALE * 2).then().scaleTo(LegacySpinner.SPRITE_SCALE * 1.28, 800, EasingFunction.Out);
      }

    });

    this.spinsPerMinute = this.drawableSpinner.spinsPerMinute.getBoundCopy();
    this.spinsPerMinute.bindValueChanged(spm =>
    {
      this.#spmCounter.text = Math.trunc(spm.value).toString();
    }, true);

    this.#completed.bindValueChanged(this.#onCompletedChanged, this, true);

    this.drawableSpinner.applyCustomUpdateState.addListener(this.updateStateTransforms, this);
    this.updateStateTransforms(this.drawableSpinner, this.drawableSpinner.state);
  }

  #onCompletedChanged(completed: ValueChangedEvent<boolean>)
  {
    if (completed.value)
    {
      const startTime = Math.min(this.time.current, this.drawableSpinner.hitStateUpdateTime - 400);

      this.absoluteSequence(startTime, () =>
      {
        this.#clear.fadeInFromZero(400, EasingFunction.Out);

        this.#clear.scaleTo(LegacySpinner.SPRITE_SCALE * 2)
          .then().scaleTo(LegacySpinner.SPRITE_SCALE * 0.8, 240, EasingFunction.Out)
          .then().scaleTo(LegacySpinner.SPRITE_SCALE, 160);
      });

      const fade_out_duration = 50;
      this.absoluteSequence(this.drawableSpinner.hitStateUpdateTime - fade_out_duration, () =>
        this.#clear.fadeOut(fade_out_duration),
      );
    }
    else
    {
      this.#clear.clearTransforms();
      this.#clear.alpha = 0;
    }
  }

  override update()
  {
    super.update();

    // TODO: should be >= DrawableSpinner.Result.TimeCompleted
    this.#completed.value = this.time.current >= this.drawableSpinner.hitObject.endTime;
  }

  protected updateStateTransforms(drawableHitObject: DrawableHitObject, state: ArmedState)
  {
    if (drawableHitObject instanceof DrawableSpinner)
    {
      this.absoluteSequence(drawableHitObject.hitObject.startTime - drawableHitObject.hitObject.timeFadeIn, () =>
      {
        this.#spmBackground.moveToOffset(new Vec2(0, -LegacySpinner.spm_hide_offset), drawableHitObject.hitObject.timeFadeIn, EasingFunction.Out);
        this.#spmCounter.moveToOffset(new Vec2(0, -LegacySpinner.spm_hide_offset), drawableHitObject.hitObject.timeFadeIn, EasingFunction.Out);
      });

      this.absoluteSequence(drawableHitObject.hitObject.startTime - drawableHitObject.hitObject.timeFadeIn, () =>
        this.#spin.fadeInFromZero(drawableHitObject.hitObject.timeFadeIn / 2),
      );

      this.absoluteSequence(drawableHitObject.hitObject.startTime, () =>
        this.approachCircle?.scaleTo(LegacySpinner.SPRITE_SCALE * 0.1, drawableHitObject.hitObject.duration),
      );

      const spinFadeOutLength = Math.min(400, drawableHitObject.hitObject.duration);

      this.absoluteSequence(drawableHitObject.hitStateUpdateTime - spinFadeOutLength, () =>
        this.#spin.fadeOutFromOne(spinFadeOutLength),
      );
    }
    else if (drawableHitObject instanceof DrawableSpinnerTick)
    {
      if (state === ArmedState.Hit)
      {
        this.absoluteSequence(drawableHitObject.hitStateUpdateTime, () =>
          this.#spin.fadeOut(300),
        );
      }
    }
  }

  override dispose(isDisposing: boolean = true)
  {
    super.dispose(isDisposing);

    this.drawableSpinner.applyCustomUpdateState.removeListener(this.updateStateTransforms, this);
  }
}
