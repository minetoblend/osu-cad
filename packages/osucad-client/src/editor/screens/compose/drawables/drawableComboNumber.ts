import {Container, Text} from "pixi.js";
import {HitObject} from "@osucad/common";
import {watchEffect} from "vue";
import {animate} from "@/utils/animate";


export class DrawableComboNumber extends Container {

  readonly comboText = new Text();

  constructor(readonly hitObject: HitObject) {
    super();

    this.comboText.anchor.set(0.5);
    this.comboText.style.fontFamily = "saira";
    this.comboText.style.fill = 0xffffff;
    this.comboText.style.fontSize = 50;


    this.addChild(this.comboText);

    watchEffect(() => {
      this.comboText.text = hitObject.comboNumber.toString();
    });
  }

  update(
    timeRelative: number,
  ) {
    const timePreempt = this.hitObject.timePreempt;
    const timeFadeIn = this.hitObject.timeFadeIn;

    this.alpha =
      timeRelative < 0
        ? animate(timeRelative, -timePreempt, -timePreempt + timeFadeIn, 0, 1)
        : animate(timeRelative, 0, 100, 1, 0);

    this.comboText.scale.set(
      animate(timeRelative, 0, 100, 1, 2),
    );


  }

}