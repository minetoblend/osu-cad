import type { HitCircle } from '@osucad/common';
import { Anchor, resolved } from 'osucad-framework';
import { PreferencesStore } from '../../preferences/PreferencesStore';
import { animate } from '../../utils/animate';
import { ApproachCircle } from './ApproachCircle';
import { CirclePiece } from './CirclePiece';
import { DrawableComboNumber } from './DrawableComboNumber';
import { DrawableHitObject } from './DrawableHitObject';

export class DrawableHitCircle extends DrawableHitObject<HitCircle> {
  constructor(public hitCircle: HitCircle) {
    super(hitCircle);
    this.origin = Anchor.Center;
  }

  circlePiece!: CirclePiece;
  approachCircle!: ApproachCircle;
  comboNumber!: DrawableComboNumber;

  override load() {
    this.addAll(
      (this.circlePiece = new CirclePiece()),
      (this.approachCircle = new ApproachCircle()),
    );
    this.circlePiece.add(
      (this.comboNumber = new DrawableComboNumber(this.hitObject.indexInCombo)),
    );

    super.load();
  }

  setup() {
    super.setup();
    this.circlePiece.comboColor = this.comboColor;
    this.circlePiece.startTime = this.hitObject.startTime;
    this.circlePiece.timePreempt = this.hitObject.timePreempt;
    this.circlePiece.timeFadeIn = this.hitObject.timeFadeIn;
    this.approachCircle.comboColor = this.comboColor;
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
