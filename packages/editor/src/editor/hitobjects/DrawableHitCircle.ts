import type { HitCircle } from '@osucad/common';
import { Anchor, resolved } from 'osucad-framework';
import { PreferencesStore } from '../../preferences/PreferencesStore';
import { animate } from '../../utils/animate';
import { ApproachCircle } from './ApproachCircle';
import { DrawableComboNumber } from './DrawableComboNumber';
import { DrawableHitObject } from './DrawableHitObject';
import { AnimatedCirclePiece } from './AnimatedCirclePiece';

export class DrawableHitCircle extends DrawableHitObject<HitCircle> {
  constructor(public hitCircle: HitCircle) {
    super(hitCircle);
    this.origin = Anchor.Center;
  }

  circlePiece!: AnimatedCirclePiece;
  approachCircle!: ApproachCircle;
  comboNumber!: DrawableComboNumber;

  override load() {
    this.addAll(
      (this.circlePiece = new AnimatedCirclePiece()),
      (this.approachCircle = new ApproachCircle()),
    );
    this.circlePiece.add(
      (this.comboNumber = new DrawableComboNumber(this.hitObject.indexInCombo)),
    );

    super.load();
  }

  setup() {
    super.setup();

    this.circlePiece.comboColor = this.hitObject.comboColor;
    this.circlePiece.timeFadeIn = this.hitObject.startTime - this.hitObject.timePreempt;
    this.circlePiece.fadeInDuration = this.hitObject.timeFadeIn;
    this.circlePiece.timeFadeOut = this.hitObject.startTime;

    this.approachCircle.comboColor = this.hitObject.comboColor;
    this.approachCircle.startTime = this.hitObject.startTime;
    this.approachCircle.timePreempt = this.hitObject.timePreempt;
    this.comboNumber.comboNumber = this.hitObject.indexInCombo;
  }

  @resolved(PreferencesStore)
  preferences!: PreferencesStore;

  update() {
    super.update();

    const time = this.time.current - this.hitObject.startTime;

    this.comboNumber.alpha
      = time > 0 && this.preferences.viewport.hitAnimations
        ? animate(time, 0, 50, 1, 0)
        : 1;
  }
}
