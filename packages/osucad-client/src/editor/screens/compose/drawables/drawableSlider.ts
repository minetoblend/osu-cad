import { EditorInstance } from "@/editor/createEditor";
import { Circle, Slider, Vec2 } from "@osucad/common";
import { Sprite, Texture, Circle as PixiCircle, Container } from "pixi.js";
import { animate } from "@/utils/animate";

import { DrawableCirclePiece } from "./drawableCirclePiece";

import approachcirclepng from "@/assets/skin/approachcircle@2x.png";
import { DrawableHitObject } from "./drawableHitObject";
import { DrawableSliderBody } from "./drawableSliderBody";
import { Ref, computed, toRef, watch } from "vue";
import { IClient } from "@osucad/unison";
import { SliderGeometrySource } from "./sliderGeometrySource";
import { DrawableSliderBall } from "./drawableSliderBall";

export class DrawableSlider extends DrawableHitObject<Slider> {
  readonly approachCircle = new Sprite(Texture.from(approachcirclepng));
  readonly circlePiece = new DrawableCirclePiece(this.editor);
  readonly sliderBody: DrawableSliderBody;

  readonly selectionOutline: DrawableSliderBody;

  readonly sliderGeoSource: SliderGeometrySource;

  readonly sliderBallSprite = new DrawableSliderBall();

  constructor(
    private slider: Slider,
    editor: EditorInstance,
    viewportScale: Readonly<Ref<number>>
  ) {
    super(slider, editor);
    this.hitArea = new PixiCircle(0, 0, this.hitObject.radius);
    this.eventMode = "static";
    this.approachCircle.anchor.set(0.5);

    this.sliderGeoSource = new SliderGeometrySource(slider);

    this.sliderBody = new DrawableSliderBody(
      this.sliderGeoSource,
      viewportScale
    );

    this.selectionOutline = new DrawableSliderBody(
      this.sliderGeoSource,
      viewportScale
    );

    this.selectionOutline.outlineOnly = true;
    this.selectionOutline.visible = false;

    const container = new Container();

    this.addChild(this.sliderBody, container, this.selectionOutline);

    container.addChild(this.circlePiece, this.approachCircle);

    container.scale.set(this.hitObject.scale);

    watch(
      () => [
        this.slider.controlPoints.controlPoints,
        this.slider.expectedDistance,
        this.sliderGeoSource.snakeInProgress.value,
        this.sliderGeoSource.snakeOutProgress.value,
      ],
      () => {
        this.sliderGeoSource.invalidate();
        this.sliderBody.updateGeometry();
        this.selectionOutline.updateGeometry();
      },
      {
        deep: true
      }
    );

    this.addChild(this.sliderBallSprite);
  }

  onHitObjectChange<K extends keyof Slider>(key: K, value: Slider[K]): void {
    super.onHitObjectChange(key, value);
  }

  update(): void {
    const currentTime = this.editor.clock.currentTimeAnimated;

    const comboColor = this.editor.container.document.objects.colors.getColor(
      this.slider.comboIndex
    );

    const timeRelative = currentTime - this.slider.startTime;
    const timePreempt =
      this.editor.container.document.objects.difficulty.timePreempt;
    const timeFadeIn =
      this.editor.container.document.objects.difficulty.timeFadeIn;

    // approach circle
    this.approachCircle.tint = comboColor;

    this.approachCircle.scale.set(
      timeRelative < 0
        ? animate(timeRelative, -timePreempt, 0, 4, 1)
        : animate(timeRelative, 0, 200, 1, 1.06)
    );

    this.circlePiece.tint = timeRelative <= 0 ? comboColor : 0xffffff;
    this.circlePiece.update();

    this.sliderBody.tint = comboColor;

    // alpha

    const fadeOut =
      timeRelative - this.slider.duration < 0
        ? 1
        : animate(timeRelative - this.slider.duration, 0, 800, 1, 0);

    const circleFadeOut =
      timeRelative < 0 ? 1 : animate(timeRelative, 0, 800, 1, 0);

    const fadeIn =
      timeRelative < 0
        ? animate(timeRelative, -timePreempt, -timePreempt + timeFadeIn, 0, 1)
        : 1;

    this.sliderGeoSource.snakeInProgress.value =
      timeRelative < 0
        ? animate(timeRelative, -timePreempt, -timePreempt + timeFadeIn, 0, 1)
        : 1;

    this.circlePiece.alpha = timeRelative < 0 ? fadeIn : circleFadeOut;

    this.sliderBody.alpha = timeRelative < 0 ? fadeIn : fadeOut;

    this.approachCircle.alpha =
      timeRelative < 0 ? animate(timeRelative, -timePreempt, 0, 0, 1) : fadeOut;

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
      // this.sliderGeoSource.snakeOutProgress.value = 0;
    }

    if (this.sliderBallSprite.visible) {
      this.sliderBallSprite.scale.set(this.hitObject.scale);
      const progress = this.slider.getProgressAtTime(currentTime);

      const position = this.slider.sliderPath.getPositionAtDistance(
        progress * this.slider.expectedDistance
      );

      this.sliderBallSprite.position.copyFrom(position);

      const sliderBallFrame = Math.max(
        Math.floor((progress * this.slider.expectedDistance) / 5) % 10,
        0
      );

      this.sliderBallSprite.currentFrame = isNaN(sliderBallFrame)
        ? 0
        : sliderBallFrame;

      const nextPos = this.slider.sliderPath.getPositionAtDistance(
        progress * this.slider.expectedDistance + 2
      );

      this.sliderBallSprite.rotation = Math.atan2(
        nextPos.y - position.y,
        nextPos.x - position.x
      );
    }
  }

  onSelected(selected: boolean, selectedBy: IClient[]): void {
    this.selectionOutline.visible = selected;
    this.selectionOutline.outlineTint = 0xffc233;
  }
}
