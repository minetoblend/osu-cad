import {EditorInstance} from "@/editor/createEditor";
import {Slider, Vec2} from "@osucad/common";
import {Circle as PixiCircle, Container, Sprite, Texture} from "pixi.js";
import {animate} from "@/utils/animate";

import {DrawableCirclePiece} from "./drawableCirclePiece";

import approachcirclepng from "@/assets/skin/approachcircle@2x.png";
import {DrawableHitObject} from "./drawableHitObject";
import {DrawableSliderBody} from "./drawableSliderBody";
import {Ref, watch, watchEffect} from "vue";
import {IClient} from "@osucad/unison";
import {SliderGeometrySource} from "./sliderGeometrySource";
import {DrawableSliderBall} from "./drawableSliderBall";
import {DrawableSliderReverse} from "@/editor/screens/compose/drawables/drawableSliderReverse";
import {DrawableSliderFollowCircle} from "@/editor/screens/compose/drawables/drawableSliderFollowCircle";
import {DrawableComboNumber} from "@/editor/screens/compose/drawables/drawableComboNumber";

export class DrawableSlider extends DrawableHitObject<Slider> {
  readonly approachCircle = new Sprite(Texture.from(approachcirclepng));
  readonly sliderHead = new DrawableCirclePiece();
  readonly sliderTail = new DrawableCirclePiece();
  readonly sliderBody: DrawableSliderBody;
  readonly comboNumber: DrawableComboNumber;

  readonly selectionOutline: DrawableSliderBody;

  readonly sliderGeoSource: SliderGeometrySource;
  readonly selectionGeoSource: SliderGeometrySource;

  readonly sliderBallSprite = new DrawableSliderBall();
  readonly followCircleSprite = new DrawableSliderFollowCircle();

  readonly reverseArrowContainer = new Container<DrawableSliderReverse>();

  constructor(
    private slider: Slider,
    editor: EditorInstance,
    viewportScale: Readonly<Ref<number>>,
  ) {
    super(slider, editor);
    this.hitArea = new PixiCircle(0, 0, this.hitObject.radius);
    this.eventMode = "static";
    this.approachCircle.anchor.set(0.5);

    this.sliderGeoSource = new SliderGeometrySource(slider);
    this.selectionGeoSource = new SliderGeometrySource(slider);

    this.sliderBody = new DrawableSliderBody(
      this.sliderGeoSource,
      viewportScale,
    );

    this.selectionOutline = new DrawableSliderBody(
      this.selectionGeoSource,
      viewportScale,
    );

    this.selectionOutline.outlineOnly = true;
    this.selectionOutline.visible = false;

    this.comboNumber = new DrawableComboNumber(slider);

    const container = new Container();

    this.addChild(this.sliderBody, container, this.selectionOutline);

    container.addChild(this.sliderTail, this.reverseArrowContainer, this.sliderHead, this.comboNumber, this.approachCircle);

    watch(
      () => [
        this.slider.controlPoints.controlPoints,
        this.slider.expectedDistance,
        this.sliderGeoSource.snakeInProgress.value,
        this.sliderGeoSource.snakeOutProgress.value,
      ],
      () => {
        this.sliderGeoSource.invalidate();
        this.selectionGeoSource.invalidate();
        this.sliderBody.updateGeometry();
        this.selectionOutline.updateGeometry();
      },
      {
        deep: true,
      },
    );

    watchEffect(() => this.initChildren());

    this.addChild(this.sliderBallSprite, this.followCircleSprite);
  }

  onHitObjectChange<K extends keyof Slider>(key: K, value: Slider[K]): void {
    super.onHitObjectChange(key, value);
  }

  get comboColor() {
    return this.editor.container.document.objects.colors.getColor(
      this.slider.comboIndex,
    );
  }

  update(): void {
    const currentTime = this.editor.clock.currentTimeAnimated;

    const comboColor = this.comboColor;

    const timeRelative = currentTime - this.slider.startTime;


    this.approachCircle.scale.set(
      this.slider.scale *
      (timeRelative < 0
          ? animate(timeRelative, -this.slider.timePreempt, 0, 4, 1)
          : animate(timeRelative, 0, 200, 1, 1.06)
      ),
    );

    this.sliderHead.tint = timeRelative <= 0 ? comboColor : 0xffffff;
    this.sliderTail.tint = (timeRelative - this.slider.duration) <= 0 ? comboColor : 0xffffff;

    // alpha

    const fadeOut =
      timeRelative - this.slider.duration < 0
        ? 1
        : animate(timeRelative - this.slider.duration, 0, 800, 1, 0);

    const circleFadeOut =
      timeRelative < 0 ? 1 : animate(timeRelative, 0, 800, 1, 0);

    const fadeIn =
      timeRelative < 0
        ? animate(timeRelative, -this.slider.timePreempt, -this.slider.timePreempt + this.slider.timeFadeIn, 0, 1)
        : 1;

    this.sliderGeoSource.snakeInProgress.value =
      timeRelative < 0
        ? animate(timeRelative, -this.slider.timePreempt, -this.slider.timePreempt + this.slider.timePreempt / 3, 0, 1)
        : 1;


    this.sliderBody.alpha = timeRelative < 0 ? fadeIn : fadeOut;

    this.approachCircle.alpha =
      timeRelative < 0 ? animate(timeRelative, -this.slider.timePreempt, 0, 0, 1)
        : animate(timeRelative, 0, 800, 1, 0)
    ;

    this.updateSliderHead(timeRelative);
    this.updateSliderTail(timeRelative);

    this.reverseArrowContainer.children.forEach((reverse) => reverse.update(timeRelative));

    this.sliderBallSprite.visible =
      timeRelative >= 0 && timeRelative <= this.slider.duration;

    const spanIndex = Math.floor(timeRelative / this.slider.spanDuration);

    if (spanIndex <= 0) {
      // this.sliderGeoSource.snakeInProgress.value =
      //   Math.max(
      //     (timeRelative / this.slider.spanDuration) % 1,
      //     0
      //   )
    } else {
      this.sliderGeoSource.snakeInProgress.value = 1;
    }

    this.comboNumber.update(timeRelative);

    this.updateSliderBall(currentTime);
  }

  updateSliderHead(timeRelative: number) {
    this.sliderHead.alpha =
      timeRelative < 0 ?
        animate(timeRelative, -this.slider.timePreempt, -this.slider.timePreempt + this.slider.timeFadeIn, 0, 1) :
        animate(timeRelative, 0, 700, 1, 0)
    ;
  }

  updateSliderTail(timeRelative: number) {
    this.sliderTail.alpha =
      timeRelative < 0 ?
        animate(timeRelative, -this.slider.timePreempt + this.slider.timePreempt / 3, 0, 0, 1) :
        animate(timeRelative, this.slider.duration, this.slider.duration + 700, 1, 0)
    ;
  }

  updateSliderBall(currentTime: number) {

    const progress = this.slider.getProgressAtTime(currentTime);

    const sliderBallPosition = this.slider.sliderPath.getPositionAtDistance(
      progress * this.slider.expectedDistance,
    );

    this.sliderBallSprite.position.copyFrom(sliderBallPosition);

    const sliderBallFrame = Math.max(
      Math.floor((progress * this.slider.expectedDistance) / 5) % 10,
      0,
    );

    this.sliderBallSprite.currentFrame = isNaN(sliderBallFrame)
      ? 0
      : sliderBallFrame;

    const nextPos = this.slider.sliderPath.getPositionAtDistance(
      progress * this.slider.expectedDistance + 2,
    );

    const delta = Vec2.sub(nextPos, sliderBallPosition);

    this.sliderBallSprite.rotation = Math.atan2(
      nextPos.y - sliderBallPosition.y,
      nextPos.x - sliderBallPosition.x,
    );

    const timeRelative = currentTime - this.slider.startTime;

    this.followCircleSprite.scale.set(this.hitObject.scale * (
      timeRelative < 150 || timeRelative < this.slider.duration / 2 ?
        animate(timeRelative, 0, 150, 0.5, 1) :
        animate(timeRelative, this.slider.duration, this.slider.duration + 150, 1, 0.75)
    ));

    this.followCircleSprite.alpha =
      timeRelative < 150 ?
        animate(timeRelative, 0, 150, 0, 1) :
        animate(timeRelative, this.slider.duration, this.slider.duration + 150, 1, 0);

    this.followCircleSprite.position.copyFrom(sliderBallPosition);
  }

  initChildren() {
    const comboColor = this.comboColor;

    this.sliderHead.scale.set(this.hitObject.scale);
    this.sliderTail.scale.set(this.hitObject.scale);
    this.sliderBallSprite.scale.set(this.hitObject.scale);

    this.sliderTail.position.copyFrom(this.slider.spans % 2 == 1 ? this.slider.sliderPath.endPosition : Vec2.zero());

    this.approachCircle.tint = comboColor;
    this.sliderBody.tint = comboColor;

    this.comboNumber.scale.set(this.hitObject.scale);

    this.initReverseArrows();
  }

  initReverseArrows() {
    this.reverseArrowContainer.children.slice(this.slider.spans - 1).forEach(it => it.destroy());

    const afterStart = this.slider.sliderPath.getPositionAtDistance(1);
    const beforeEnd = this.slider.sliderPath.getPositionAtDistance(this.slider.expectedDistance - 1);

    const sliderEndPos = this.slider.sliderPath.endPosition;

    const startAngle = Math.atan2(afterStart.y, afterStart.x);
    const endAngle = Math.atan2(beforeEnd.y - sliderEndPos.y, beforeEnd.x - sliderEndPos.x);

    for (let i = 0; i < this.slider.spans - 1; i++) {
      let reverse = this.reverseArrowContainer.children[i];
      if (!reverse) {
        reverse = new DrawableSliderReverse(this.hitObject);
        this.reverseArrowContainer.addChild(reverse);
      }

      reverse.scale.set(this.hitObject.scale);
      reverse.startTime = this.slider.spanDuration * (i + 1);
      reverse.tint = this.comboColor;
      reverse.position.copyFrom(
        i % 2 == 0 ? this.slider.sliderPath.endPosition : Vec2.zero(),
      );

      reverse.rotation = i % 2 == 0 ? endAngle : startAngle;
    }
  }

  onSelected(selected: boolean, selectedBy: IClient[]): void {
    this.selectionOutline.visible = selected;
    this.selectionOutline.outlineTint = 0xffc233;
  }
}
