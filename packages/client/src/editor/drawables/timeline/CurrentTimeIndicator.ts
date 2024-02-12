import {Drawable} from "../Drawable.ts";
import {BitmapText} from "pixi.js";
import {Inject} from "../di";
import {EditorContext} from "@/editor/editorContext.ts";

export class CurrentTimeIndicator extends Drawable {


  private readonly textStyle = {
    fontFamily: "Nunito Sans",
    fontSize: 35,
    fill: 0xffffff,
  } as const;

  private readonly timestamp = {
    minutes: new BitmapText({
      text: "00",
      style: this.textStyle,
      x: 5,
      anchor: {x: 0, y: 0.5}
    }),
    seconds: new BitmapText({
      text: "00",
      style: this.textStyle,
      x: 56,
      anchor: {x: 0, y: 0.5}
    }),
    millis: new BitmapText({
      text: "000",
      style: this.textStyle,
      x: 112,
      anchor: {x: 0, y: 0.5}
    }),
    separator1: new BitmapText({
      text: ":",
      style: this.textStyle,
      x: 48,
      anchor: {x: 0, y: 0.5}
    }),
    separator2: new BitmapText({
      text: ":",
      style: this.textStyle,
      x: 102,
      anchor: {x: 0, y: 0.5}
    }),
  };


  onLoad() {
    const {minutes, millis, seconds, separator1, separator2} = this.timestamp;
    this.addChild(minutes, separator1, seconds, separator2, millis);
  }

  @Inject(EditorContext)
  private readonly editor!: EditorContext;

  onTick() {
    this.updateTimestamp();
  }

  updateTimestamp() {
    const time = Math.round(this.editor.clock.currentTimeAnimated);
    const minutes = Math.floor(time / 60_000);
    const seconds = Math.floor(time / 1000 % 60);
    const milliseconds = Math.floor(time % 1000);

    this.timestamp.minutes.text = minutes.toString().padStart(2, "0");
    this.timestamp.seconds.text = seconds.toString().padStart(2, "0");
    this.timestamp.millis.text = milliseconds.toString().padStart(3, "0");
  }

}