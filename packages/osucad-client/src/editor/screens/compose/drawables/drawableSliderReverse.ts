import {Container, Sprite, Texture} from "pixi.js";
import {DrawableCirclePiece} from "@/editor/screens/compose/drawables/drawableCirclePiece";
import {HitObject} from "@osucad/common";
import {animate} from "@/utils/animate";
import reverseArrowPng from "@/assets/skin/reversearrow@2x.png";

const reverseArrowTexture = Texture.from(reverseArrowPng);


export class DrawableSliderReverse extends Container {

  readonly circlePiece = new DrawableCirclePiece();
  readonly reverseArrow = new Sprite(reverseArrowTexture);

  constructor(
    readonly hitObject: HitObject,
  ) {
    super();

    this.reverseArrow.anchor.set(0.5);

    this.addChild(this.circlePiece, this.reverseArrow);
  }

  startTime = 0;

  set tint(value: number) {
    this.circlePiece.tint = value;
  }

  update(time: number) {
    time -= this.startTime;

    this.alpha =
      time < 0 ? animate(time, -this.hitObject.timePreempt, -this.hitObject.timePreempt + this.hitObject.timeFadeIn, 0, 1)
        : animate(time, 0, 150, 1, 0)
    ;

    const scale = animate(time, 0, 150, 1, 2);

    this.circlePiece.scale.set(scale);
    this.reverseArrow.scale.set(scale);
  }

}