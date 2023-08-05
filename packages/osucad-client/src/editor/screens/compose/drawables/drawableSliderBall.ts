import {AnimatedSprite, Container, Texture} from "pixi.js";

import sliderb0Png from "@/assets/skin/sliderb0@2x.png";
import sliderb1Png from "@/assets/skin/sliderb1@2x.png";
import sliderb2Png from "@/assets/skin/sliderb2@2x.png";
import sliderb3Png from "@/assets/skin/sliderb3@2x.png";
import sliderb4Png from "@/assets/skin/sliderb4@2x.png";
import sliderb5Png from "@/assets/skin/sliderb5@2x.png";
import sliderb6Png from "@/assets/skin/sliderb6@2x.png";
import sliderb7Png from "@/assets/skin/sliderb7@2x.png";
import sliderb8Png from "@/assets/skin/sliderb8@2x.png";
import sliderb9Png from "@/assets/skin/sliderb9@2x.png";

const sliderb0 = Texture.from(sliderb0Png);
const sliderb1 = Texture.from(sliderb1Png);
const sliderb2 = Texture.from(sliderb2Png);
const sliderb3 = Texture.from(sliderb3Png);
const sliderb4 = Texture.from(sliderb4Png);
const sliderb5 = Texture.from(sliderb5Png);
const sliderb6 = Texture.from(sliderb6Png);
const sliderb7 = Texture.from(sliderb7Png);
const sliderb8 = Texture.from(sliderb8Png);
const sliderb9 = Texture.from(sliderb9Png);


export class DrawableSliderBall extends Container {
  sprite: AnimatedSprite;

  constructor() {
    super();

    this.sprite = new AnimatedSprite(
      [
        sliderb0,
        sliderb1,
        sliderb2,
        sliderb3,
        sliderb4,
        sliderb5,
        sliderb6,
        sliderb7,
        sliderb8,
        sliderb9,
      ],
      false,
    );

    this.sprite.anchor.set(0.5);

    this.addChild(this.sprite);
  }

  set currentFrame(frame: number) {
    this.sprite.currentFrame = frame;
  }
}
