import { HitObjectDrawable } from './HitObjectDrawable.ts';
import { Slider, Vec2 } from '@osucad/common';
import { Anchor } from '@/framework/drawable/Anchor.ts';
import { CirclePieceDrawable } from './CirclePieceDrawable.ts';
import { ApproachCircleDrawable } from './ApproachCircleDrawable.ts';
import { DrawableSliderBody } from './DrawableSliderBody.ts';
import { animate } from '../../editorOld/drawables/animate.ts';
import { EditorClock } from '../EditorClock.ts';
import { resolved } from '../../framework/di/DependencyLoader.ts';
import { DrawableComboNumber } from './DrawableComboNumber.ts';

export class SliderDrawable extends HitObjectDrawable<Slider> {
  constructor(public slider: Slider) {
    super(slider);
    this.anchor = Anchor.Centre;
  }

  headCircle!: CirclePieceDrawable;
  tailCircle!: CirclePieceDrawable;
  approachCircle!: ApproachCircleDrawable;
  sliderBody!: DrawableSliderBody;
  comboNumber!: DrawableComboNumber;

  override load() {
    this.sliderBody = this.add(new DrawableSliderBody(this.hitObject));
    this.headCircle = this.add(new CirclePieceDrawable());
    this.tailCircle = this.add(new CirclePieceDrawable());
    this.approachCircle = this.add(new ApproachCircleDrawable());
    this.comboNumber = this.add(
      new DrawableComboNumber(this.hitObject.indexInCombo),
    );
    this.sliderBody.alpha = 0;
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
    this.tailCircle.position.copyFrom(
      Vec2.scale(
        Vec2.sub(this.hitObject.endPosition, this.hitObject.position),
        1 / this.hitObject.scale,
      ),
    );

    this.sliderBody.scale = new Vec2(1 / this.hitObject.scale);
    this.sliderBody.setup();

    this.approachCircle.comboColor = this.comboColor;
    this.approachCircle.startTime = this.hitObject.startTime;
    this.approachCircle.timePreempt = this.hitObject.timePreempt;
  }

  @resolved(EditorClock)
  private readonly clock!: EditorClock;

  onTick() {
    super.onTick();
    const time = this.clock.currentTimeAnimated - this.hitObject.startTime;

    if (time < 0) {
      this.sliderBody.alpha = animate(
        time,
        -this.hitObject.timePreempt,
        -this.hitObject.timePreempt + this.hitObject.timeFadeIn,
        0,
        0.8,
      );
    } else if (time < this.hitObject.duration) {
      this.sliderBody.alpha = 0.8;
    } else {
      this.sliderBody.alpha = animate(
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
