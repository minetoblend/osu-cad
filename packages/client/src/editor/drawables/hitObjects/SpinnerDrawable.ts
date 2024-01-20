import {HitObjectDrawable} from "./HitObjectDrawable.ts";
import {Spinner} from "@osucad/common";
import {Assets, Point, Sprite} from "pixi.js";
import {animate} from "../animate.ts";

export class SpinnerDrawable extends HitObjectDrawable<Spinner> {

  constructor(spinner: Spinner) {
    super(spinner);
  }

  private bottom = new Sprite({
    texture: Assets.get("spinner-bottom"),
    anchor: new Point(0.5, 0.5),
  });
  private middle = new Sprite({
    texture: Assets.get("spinner-middle"),
    anchor: new Point(0.5, 0.5),
  });
  private top = new Sprite({
    texture: Assets.get("spinner-top"),
    anchor: new Point(0.5, 0.5),
  });

  onLoad() {
    super.onLoad();
    this.addChild(this.bottom, this.middle, this.top);
  }

  setup() {
    this.scale.set(0.6);
    this.middle.tint = this.hitObject.isSelected ? 0x3d74ff : 0xffffff;
  }

  previousTime !: number;
  currentRotation = 0;

  onTick() {
    super.onTick();
    if (this.previousTime === undefined) this.previousTime = this.editor.clock.currentTimeAnimated;


    const timeSinceStart = this.editor.clock.currentTimeAnimated - this.hitObject.startTime;
    const spinUpTime = Math.min(500, this.hitObject.duration * 0.75);
    const spinDownTime = Math.min(350, this.hitObject.duration * 0.25);

    let spinSpeed = 0;

    if (timeSinceStart < 0) {
      spinSpeed = 0;
      this.alpha = animate(timeSinceStart, -this.hitObject.timePreempt, -this.hitObject.timePreempt + this.hitObject.timeFadeIn, 0, 1);
    } else if (timeSinceStart < spinUpTime) {
      spinSpeed = (timeSinceStart / spinUpTime) ** 2;
      this.alpha = 1;
    } else if (timeSinceStart > this.hitObject.duration) {
      spinSpeed = 0;
      this.alpha = animate(timeSinceStart, this.hitObject.duration, this.hitObject.duration + spinDownTime, 1, 0);
      spinSpeed = ((this.hitObject.duration - timeSinceStart + spinDownTime) / spinDownTime) ** 2;

    } else if (timeSinceStart < this.hitObject.duration) {
      spinSpeed = 1;
      this.alpha = 1;
    }
    spinSpeed *= 2.5;

    this.currentRotation += spinSpeed * 0.5 * (this.editor.clock.currentTimeAnimated - this.previousTime);

    this.top.angle = -this.currentRotation;
    this.bottom.angle = -this.currentRotation * 0.25;
    this.bottom.alpha = 0.8;

    this.previousTime = this.editor.clock.currentTimeAnimated;
  }

}