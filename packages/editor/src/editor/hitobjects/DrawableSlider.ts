import { Slider } from '@osucad/common';
import { DrawableHitObject } from './DrawableHitObject';
import { Anchor, Vec2 } from 'osucad-framework';
import { CirclePiece } from './CirclePiece';
import { ApproachCircle } from './ApproachCircle';
import { DrawableSliderBody } from './DrawableSliderBody';
import { DrawableComboNumber } from './DrawableComboNumber';
import { animate } from '../../utils/animate';

export class DrawableSlider extends DrawableHitObject<Slider> {
  constructor(public slider: Slider) {
    super(slider);
    this.origin = Anchor.Center;
  }

  headCircle!: CirclePiece;
  tailCircle!: CirclePiece;
  approachCircle!: ApproachCircle;
  sliderBody!: DrawableSliderBody;
  comboNumber!: DrawableComboNumber;

  override load() {
    this.add((this.sliderBody = new DrawableSliderBody(this.hitObject)));
    this.add((this.headCircle = new CirclePiece()));
    this.add((this.approachCircle = new ApproachCircle()));
    this.add(
      (this.comboNumber = new DrawableComboNumber(this.hitObject.indexInCombo)),
    );
    this.add((this.tailCircle = new CirclePiece()));
    super.load();
  }

  setup() {
    super.setup();
    this.comboNumber.comboNumber = this.hitObject.indexInCombo;
    this.headCircle.comboColor = this.comboColor;
    this.headCircle.startTime = this.hitObject.startTime;
    this.headCircle.timePreempt = this.hitObject.timePreempt;
    this.headCircle.timeFadeIn = this.hitObject.timeFadeIn;
    this.headCircle.comboColor = this.comboColor;
    this.tailCircle.startTime = this.hitObject.endTime;
    this.tailCircle.timePreempt =
      this.hitObject.timePreempt +
      Math.min(150, this.hitObject.spanDuration / 2);
    this.tailCircle.timeFadeIn = this.hitObject.timeFadeIn;
    this.tailCircle.comboColor = this.comboColor;
    (this.tailCircle.position = Vec2.scale(
      Vec2.sub(this.hitObject.endPosition, this.hitObject.position),
      1 / this.hitObject.scale,
    )),
      (this.sliderBody.scale = new Vec2(1 / this.hitObject.scale));
    this.sliderBody.setup();

    this.approachCircle.comboColor = this.comboColor;
    this.approachCircle.startTime = this.hitObject.startTime;
    this.approachCircle.timePreempt = this.hitObject.timePreempt;
  }

  update() {
    super.update();
    const time = this.time.current - this.hitObject.startTime;

    if (time < 0) {
      this.sliderBody.bodyAlpha = animate(
        time,
        -this.hitObject.timePreempt,
        -this.hitObject.timePreempt + this.hitObject.timeFadeIn,
        0,
        0.8,
      );
    } else if (time < this.hitObject.duration) {
      this.sliderBody.bodyAlpha = 0.8;
    } else {
      this.sliderBody.bodyAlpha = animate(
        time,
        this.hitObject.duration,
        this.hitObject.duration + 300,
        0.8,
        0,
      );
    }
    this.comboNumber.alpha = this.headCircle.alpha;
  }
}
