import {HitCircle} from "@osucad/common";
import {HitObjectDrawable} from "./HitObjectDrawable.ts";
import {ApproachCircle} from "./ApproachCircle.ts";
import {CirclePiece} from "./CirclePiece.ts";
import {DrawableComboNumber} from "./DrawableComboNumber.ts";
import {SelectionCircle} from "./SelectionCircle.ts";

export class HitCircleDrawable extends HitObjectDrawable<HitCircle> {

  private readonly circlePiece = new CirclePiece();
  private readonly approachCircle = new ApproachCircle();
  private readonly comboNumber = new DrawableComboNumber(0);
  private readonly selectionCircle = new SelectionCircle();

  constructor(circle: HitCircle) {
    super(circle);
  }

  onLoad() {
    super.onLoad();
    this.addChild(
      this.approachCircle,
      this.circlePiece,
      this.selectionCircle,
    );
    this.circlePiece.addChild(this.comboNumber);
  }

  setup() {
    super.setup();
    this.approachCircle.startTime = this.hitObject.startTime;
    this.approachCircle.timePreempt = this.hitObject.timePreempt;
    this.circlePiece.startTime = this.hitObject.startTime;
    this.circlePiece.timePreempt = this.hitObject.timePreempt;
    this.circlePiece.timeFadeIn = this.hitObject.timeFadeIn;
    this.circlePiece.comboColor = this.comboColor;
    this.approachCircle.tint = this.comboColor;


    this.selectionCircle.visible = this.hitObject.isSelected;
  }

  onTick() {
    super.onTick();
    this.comboNumber.number = this.hitObject.indexInCombo + 1;
  }
}