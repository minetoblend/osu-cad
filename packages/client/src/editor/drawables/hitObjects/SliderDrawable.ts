import {HitObjectDrawable} from "./HitObjectDrawable.ts";
import {Slider, Vec2} from "@osucad/common";
import {CirclePiece} from "./CirclePiece.ts";
import {ApproachCircle} from "./ApproachCircle.ts";
import {Container, DestroyOptions} from "pixi.js";
import {animate} from "../animate.ts";
import {SliderBallDrawable} from "./SliderBallDrawawble.ts";
import {ReverseArrowDrawable} from "./ReverseArrowDrawable.ts";
import {DrawableComboNumber} from "./DrawableComboNumber.ts";
import {DrawableSliderBody} from "./DrawableSliderBody.ts";
import {SelectionCircle} from "./SelectionCircle.ts";

export class SliderDrawable extends HitObjectDrawable<Slider> {

  private readonly headCircle = new CirclePiece();
  private readonly tailCircle = new CirclePiece();
  private readonly approachCircle = new ApproachCircle();
  private readonly sliderBall = new SliderBallDrawable();
  private readonly reverseArrows = new Container();
  private readonly comboNumber = new DrawableComboNumber(0);
  private readonly startSelectionCircle = new SelectionCircle();
  private readonly endSelectionCircle = new SelectionCircle();

  constructor(hitObject: Slider) {
    super(hitObject);
    this.sliderBody = new DrawableSliderBody(hitObject);
  }

  onLoad() {
    super.onLoad();
    this.sliderBody.alpha = 0;

    this.addChild(this.sliderBody, this.tailCircle, this.reverseArrows, this.approachCircle, this.headCircle, this.sliderBall, this.endSelectionCircle, this.startSelectionCircle);
    this.headCircle.addChild(this.comboNumber);
  }

  private readonly sliderBody: DrawableSliderBody;

  setup() {
    super.setup();
    this.approachCircle.tint = this.comboColor;
    this.approachCircle.startTime = this.hitObject.startTime;
    this.approachCircle.timePreempt = this.hitObject.timePreempt;
    this.headCircle.startTime = this.hitObject.startTime;
    this.headCircle.timePreempt = this.hitObject.timePreempt;
    this.headCircle.timeFadeIn = this.hitObject.timeFadeIn;
    this.headCircle.comboColor = this.comboColor;
    this.tailCircle.startTime = this.hitObject.endTime;
    this.tailCircle.timePreempt = this.hitObject.timePreempt + Math.min(150, this.hitObject.spanDuration / 2);
    this.tailCircle.timeFadeIn = this.hitObject.timeFadeIn;
    this.tailCircle.comboColor = this.comboColor;
    this.tailCircle.position.copyFrom(Vec2.scale(Vec2.sub(this.hitObject.endPosition, this.hitObject.position), 1 / this.hitObject.scale));
    this.sliderBall.startTime = this.hitObject.startTime;
    this.sliderBall.endTime = this.hitObject.endTime;
    this.endSelectionCircle.position.copyFrom(Vec2.scale(this.hitObject.path.endPosition, 1 / this.hitObject.scale));
    this.startSelectionCircle.visible = this.hitObject.isSelected;
    this.endSelectionCircle.visible = this.hitObject.isSelected;

    this.reverseArrows.removeChildren();
    for (let i = 0; i < this.hitObject.repeats; i++) {
      const time = this.hitObject.startTime + this.hitObject.spanDuration;
      const circle = new CirclePiece();
      circle.startTime = time;
      circle.timePreempt = this.hitObject.timePreempt;
      circle.timeFadeIn = this.hitObject.timeFadeIn;
      circle.comboColor = this.comboColor;

      const angle = i % 2 == 0 ? this.hitObject.endAngle : this.hitObject.startAngle;

      const reverseArrow = new ReverseArrowDrawable();
      reverseArrow.rotation = angle + Math.PI;
      reverseArrow.startTime = time;
      reverseArrow.timePreempt = this.hitObject.timePreempt;

      this.reverseArrows.addChild(circle, reverseArrow);
      if (i % 2 === 0) {
        const position = Vec2.scale(this.hitObject.path.endPosition, 1 / this.hitObject.scale);
        reverseArrow.position.copyFrom(position);
        circle.position.copyFrom(position);
      }
    }

    this.sliderBody.scale.set(1 / this.hitObject.scale);

    this.eventMode = "dynamic";
  }


  onTick() {
    super.onTick();

    const time = this.editor.clock.currentTimeAnimated - this.hitObject.startTime;

    if (time < 0) {
      this.sliderBody.alpha = animate(time, -this.hitObject.timePreempt, -this.hitObject.timePreempt + this.hitObject.timeFadeIn, 0, 0.8);
    } else if (time < this.hitObject.duration) {
      this.sliderBody.alpha = 0.8;
    } else {
      this.sliderBody.alpha = animate(time, this.hitObject.duration, this.hitObject.duration + 300, 0.8, 0);
    }

    const position = this.hitObject.positionAt(this.editor.clock.currentTimeAnimated);
    this.sliderBall.position.copyFrom(Vec2.scale(position, 1 / this.hitObject.scale));
    this.comboNumber.number = this.hitObject.indexInCombo + 1;

    this.sliderBody.setup();
  }

  destroy(options?: DestroyOptions) {
    super.destroy(options);
  }

}