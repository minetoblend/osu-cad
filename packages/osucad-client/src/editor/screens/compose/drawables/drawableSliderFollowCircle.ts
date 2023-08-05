import {Container, Sprite, Texture} from "pixi.js";
import sliderFollowCirclePng from "@/assets/skin/sliderfollowcircle@2x.png";

const texture = Texture.from(sliderFollowCirclePng);

export class DrawableSliderFollowCircle extends Sprite {

  constructor() {
    super(texture);

    this.anchor.set(0.5);
  }


}