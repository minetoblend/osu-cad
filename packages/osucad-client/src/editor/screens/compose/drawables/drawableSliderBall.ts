import { AnimatedSprite, Container, Texture } from "pixi.js";

import sliderb0 from "@/assets/skin/sliderb0@2x.png";
import sliderb1 from "@/assets/skin/sliderb1@2x.png";
import sliderb2 from "@/assets/skin/sliderb2@2x.png";
import sliderb3 from "@/assets/skin/sliderb3@2x.png";
import sliderb4 from "@/assets/skin/sliderb4@2x.png";
import sliderb5 from "@/assets/skin/sliderb5@2x.png";
import sliderb6 from "@/assets/skin/sliderb6@2x.png";
import sliderb7 from "@/assets/skin/sliderb7@2x.png";
import sliderb8 from "@/assets/skin/sliderb8@2x.png";
import sliderb9 from "@/assets/skin/sliderb9@2x.png";

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
      ].map((url) => Texture.from(url)),
      false
    );

    this.sprite.anchor.set(0.5);

    this.addChild(this.sprite);
  }

  set currentFrame(frame: number) {
    this.sprite.currentFrame = frame
  }
}
