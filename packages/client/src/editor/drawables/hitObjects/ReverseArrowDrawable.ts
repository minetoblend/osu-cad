import {Assets, Point, Sprite} from "pixi.js";
import {Drawable} from "../Drawable.ts";
import {Inject} from "../di";
import {EditorInstance} from "../../editorClient.ts";
import {animate} from "../animate.ts";
import {BeatInfo} from "../../beatInfo.ts";

export class ReverseArrowDrawable extends Drawable {

  readonly reverseArrow = new Sprite({
    texture: Assets.get("reversearrow"),
    anchor: new Point(0.5, 0.5),
  });

  startTime = 0;
  timePreempt = 0;

  constructor() {
    super();
    this.addChild(this.reverseArrow);
    this.alpha = 0;
  }


  @Inject(EditorInstance)
  editor!: EditorInstance;

  @Inject(BeatInfo)
  beatInfo!: BeatInfo;

  onTick() {
    const time = this.editor.clock.currentTimeAnimated - this.startTime;

    if (time < 0) {
      this.alpha = animate(time, -this.timePreempt, -this.timePreempt + 150, 0, 1);
      this.scale.set(1.2 - this.beatInfo.beatProgress * 0.2);
    } else {
      this.alpha = animate(time, 0, 150, 1, 0);
      this.scale.set(
        animate(time, 0, 150, 1, 2),
      );
    }
  }

}
