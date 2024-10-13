import type { Drawable } from 'osucad-framework';
import type { HitCircle } from '../../beatmap/hitObjects/HitCircle';
import { Anchor, Axes, Bindable, Container, dependencyLoader, EasingFunction, resolved } from 'osucad-framework';
import { HitReceptor } from '../../beatmap/hitObjects/HitReceptor';
import { HitResult } from '../../beatmap/hitObjects/HitResult';
import { OsuHitObject } from '../../beatmap/hitObjects/OsuHitObject';
import { OsucadConfigManager } from '../../config/OsucadConfigManager';
import { OsucadSettings } from '../../config/OsucadSettings';
import { ISkinSource } from '../../skinning/ISkinSource';
import { OsuSkinComponentLookup } from '../../skinning/OsuSkinComponentLookup';
import { SkinnableDrawable } from '../../skinning/SkinnableDrawable';
import { EditorMixer } from '../EditorMixer';
import { ArmedState } from './ArmedState';
import { ClickAction } from './ClickAction';
import { DrawableOsuHitObject } from './DrawableOsuHitObject';

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

  @resolved(EditorMixer)
  mixer!: EditorMixer;

  @resolved(ISkinSource)
  skin!: ISkinSource;

  onApplied() {
    super.onApplied();
  }

  @dependencyLoader()
  load() {
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

  protected checkForResult(userTriggered: boolean, timeOffset: number) {
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

  updateInitialTransforms() {
    this.circlePiece.fadeInFromZero(this.hitObject!.timeFadeIn);

    this.approachCircle.fadeOut().fadeTo(0.9, Math.min(this.hitObject!.timeFadeIn * 2, this.hitObject!.timePreempt));
    this.approachCircle.scaleTo(4).scaleTo(1, this.hitObject!.timePreempt);
  }

  protected updateHitStateTransforms(state: ArmedState) {
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

  override update() {
    super.update();
  }
}
