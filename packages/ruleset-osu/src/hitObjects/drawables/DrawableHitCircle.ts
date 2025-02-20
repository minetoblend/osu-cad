import type { Drawable, ReadonlyDependencyContainer } from '@osucad/framework';
import type { HitCircle } from '../HitCircle';
import { ArmedState, AudioMixer, HitResult, ISkinSource, OsucadConfigManager, OsucadSettings, SkinnableDrawable } from '@osucad/core';
import { Anchor, Axes, Bindable, Container, EasingFunction, resolved } from '@osucad/framework';
import { OsuSkinComponentLookup } from '../../skinning/stable/OsuSkinComponentLookup';
import { ClickAction } from '../../ui/ClickAction';
import { OsuHitObject } from '../OsuHitObject';
import { DrawableOsuHitObject } from './DrawableOsuHitObject';
import { HitReceptor } from './HitReceptor';

export class DrawableHitCircle extends DrawableOsuHitObject<HitCircle> {
  constructor(h?: HitCircle) {
    super(h);
  }

  circlePiece!: Drawable;

  approachCircle!: SkinnableDrawable;

  get circlePieceComponent() {
    return OsuSkinComponentLookup.HitCircle;
  }

  get hitAction() {
    return this.hitArea.hitAction;
  }

  #scaleContainer!: Container;

  readonly hitAnimationsEnabled = new Bindable(false);

  hitArea!: HitReceptor;

  @resolved(OsucadConfigManager)
  private config!: OsucadConfigManager;

  @resolved(AudioMixer)
  mixer!: AudioMixer;

  @resolved(ISkinSource)
  skin!: ISkinSource;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.config.bindWith(OsucadSettings.HitAnimations, this.hitAnimationsEnabled);

    this.origin = Anchor.Center;
    this.size = OsuHitObject.object_dimensions;

    this.addInternal(
      this.#scaleContainer = new Container({
        relativeSizeAxes: Axes.Both,
        origin: Anchor.Center,
        anchor: Anchor.Center,
        children: [
          this.circlePiece = new SkinnableDrawable(this.circlePieceComponent).with({
            anchor: Anchor.Center,
            origin: Anchor.Center,
            alpha: 0,
          }),
          this.approachCircle = new SkinnableDrawable(OsuSkinComponentLookup.ApproachCircle).with({
            anchor: Anchor.Center,
            origin: Anchor.Center,
            relativeSizeAxes: Axes.Both,
            alpha: 0,
            scale: 4,
          }),
          this.hitArea = new HitReceptor(() => this.updateResult(true)),
        ],
      }),
    );

    this.positionBindable.addOnChangeListener(() => this.updatePosition());
    this.stackHeightBindable.addOnChangeListener(() => this.updatePosition());
    this.scaleBindable.addOnChangeListener(scale => this.#scaleContainer.scale = scale.value);

    this.hitAnimationsEnabled.valueChanged.addListener(() => this.scheduler.addOnce(this.refreshTransforms, this));
  }

  resultFor(timeOffset: number) {
    return this.hitObject!.hitWindows.resultFor(timeOffset);
  }

  protected override checkForResult(userTriggered: boolean, timeOffset: number) {
    if (!userTriggered) {
      if (!this.hitObject!.hitWindows.canBeHit(timeOffset))
        this.applyResult(r => r.type = HitResult.Miss);

      return;
    }

    const result = this.resultFor(timeOffset);
    const clickAction = this.checkHittable?.(this, timeOffset, result);

    if (result === HitResult.None || clickAction !== ClickAction.Hit)
      return;

    this.applyResult(r => r.type = result);
  }

  override updateInitialTransforms() {
    this.circlePiece.fadeInFromZero(this.hitObject!.timeFadeIn);

    this.approachCircle.fadeOut().fadeTo(0.9, Math.min(this.hitObject!.timeFadeIn * 2, this.hitObject!.timePreempt));
    this.approachCircle.scaleTo(4).scaleTo(1, this.hitObject!.timePreempt);
  }

  protected override updateHitStateTransforms(state: ArmedState) {
    super.updateHitStateTransforms(state);

    switch (state) {
      case ArmedState.Hit:
        if (this.hitAnimationsEnabled.value) {
          this.approachCircle.fadeOut();
        }
        else {
          this.approachCircle.scaleTo(1.1, 120, EasingFunction.OutCubic);
          this.approachCircle.fadeOut(700);
        }
        break;
      case ArmedState.Miss:
        this.fadeOut(100);
    }

    this.delay(800).fadeOut();
  }

  protected updatePosition() {
    this.position = this.hitObject!.stackedPosition;
  }
}
