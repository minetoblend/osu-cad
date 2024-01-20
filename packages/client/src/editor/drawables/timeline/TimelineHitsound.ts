import {BitmapText, Container, Point} from "pixi.js";
import {Additions, HitSound, SampleSet} from "@osucad/common";

export class TimelineHitSound extends Container {

  constructor() {
    super();
    this.addChild(this.text);
  }

  text: BitmapText = new BitmapText({
    text: "A",
    style: {
      fontFamily: "Nunito Sans",
      fontSize: 12,
      fill: 0xffffff,
    },
    position: { x: 0, y: -30 },
    anchor: new Point(0.5, 0),
    eventMode: "static",
    hitArea: {
      contains: (x, y) =>
        this.text.visible && x >= 0 && x <= this.text.width && y >= 0 && y <= this.text.height,
    },
  });

  update(hitSound: HitSound) {
    let text = "";
    switch (hitSound.sampleSet) {
      case SampleSet.Auto:
        text += "A";
        break;
      case SampleSet.Normal:
        text += "N";
        break;
      case SampleSet.Soft:
        text += "S";
        break;
      case SampleSet.Drum:
        text += "D";
        break;
    }
    text += ":";
    switch (hitSound.additionSet) {
      case SampleSet.Auto:
        text += "A";
        break;
      case SampleSet.Normal:
        text += "N";
        break;
      case SampleSet.Soft:
        text += "S";
        break;
      case SampleSet.Drum:
        text += "D";
        break;
    }
    if (hitSound.additions)
      text += ":";
    if (hitSound.additions & Additions.Whistle)
      text += "W";
    if (hitSound.additions & Additions.Finish)
      text += "F";
    if (hitSound.additions & Additions.Clap)
      text += "C";

    this.text.text = text;
  }
}