import type {
  Drawable,
} from 'osucad-framework';
import type { HitCircle } from '../../beatmap/hitObjects/HitCircle';
import {
  Anchor,
  Axes,
  Bindable,
  Container,
  dependencyLoader,
  EasingFunction,
  resolved,
} from 'osucad-framework';
import { OsuHitObject } from '../../beatmap/hitObjects/OsuHitObject';
import { OsucadConfigManager } from '../../config/OsucadConfigManager';
import { OsucadSettings } from '../../config/OsucadSettings';
import { OsuSkinComponentLookup } from '../../skinning/OsuSkinComponentLookup';
import { SkinnableDrawable } from '../../skinning/SkinnableDrawable';
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

  #scaleContainer!: Container;

  readonly hitAnimationsEnabled = new Bindable(false);

  @resolved(OsucadConfigManager)
  private config!: OsucadConfigManager;

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
        ],
      }),
    );

    this.positionBindable.addOnChangeListener(() => this.updatePosition());
    this.stackHeightBindable.addOnChangeListener(() => this.updatePosition());
    this.scaleBindable.addOnChangeListener(scale => this.#scaleContainer.scale = scale.value);

    this.hitAnimationsEnabled.valueChanged.addListener(() => this.scheduler.addOnce(this.updateState, this));
  }

  updateInitialTransforms() {
    this.circlePiece.fadeInFromZero(this.hitObject!.timeFadeIn);

    this.approachCircle.fadeOut().fadeTo(0.9, Math.min(this.hitObject!.timeFadeIn * 2, this.hitObject!.timePreempt));
    this.approachCircle.scaleTo(4).scaleTo(1, this.hitObject!.timePreempt);
  }

  updateStartTimeTransforms() {
    if (this.hitAnimationsEnabled.value) {
      this.circlePiece.fadeOut(240);
      this.circlePiece.scaleTo(1.5, 240);
      this.approachCircle.fadeOut();

      this.lifetimeEnd = this.hitObject!.endTime + 240;
    }
    else {
      this.circlePiece.fadeOut(700);

      this.approachCircle.scaleTo(1.1, 120, EasingFunction.OutCubic);
      this.approachCircle.fadeOut(700);

      this.lifetimeEnd = this.hitObject!.endTime + 700;
    }
  }

  protected updateEndTimeTransforms() {
    super.updateEndTimeTransforms();

    this.delay(800).fadeOut();
  }

  protected updatePosition() {
    this.position = this.hitObject!.stackedPosition;
  }
}
