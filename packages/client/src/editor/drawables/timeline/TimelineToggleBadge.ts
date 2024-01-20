import {BitmapText, Point} from "pixi.js";

export class TimelineToggleBadge {

  text: BitmapText;

  constructor(text: String) {
    this.text = new BitmapText({
      text,
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
  }

}