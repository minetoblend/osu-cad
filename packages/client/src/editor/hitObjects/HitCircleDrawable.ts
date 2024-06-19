import { HitObjectDrawable } from './HitObjectDrawable.ts';
import { HitCircle, Vec2 } from '@osucad/common';
import { Anchor } from '@/framework/drawable/Anchor.ts';
import { CirclePieceDrawable } from './CirclePieceDrawable.ts';
import { ApproachCircleDrawable } from './ApproachCircleDrawable.ts';

export class HitCircleDrawable extends HitObjectDrawable {
  constructor(public hitCircle: HitCircle) {
    super(hitCircle);
    this.anchor = Anchor.Centre;

    this.scale = new Vec2(this.hitObject.scale);
  }

  circlePiece!: CirclePieceDrawable;
  approachCircle!: ApproachCircleDrawable;

  override load() {
    this.circlePiece = this.add(new CirclePieceDrawable());
    this.approachCircle = this.add(new ApproachCircleDrawable());
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
  }
}
