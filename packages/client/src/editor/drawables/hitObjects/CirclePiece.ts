import {Drawable} from "../Drawable.ts";
import {Assets, Point, Sprite} from "pixi.js";
import {animate, Easing} from "../animate.ts";
import {Inject} from "../di";
import {usePreferences} from "@/composables/usePreferences.ts";
import {EditorContext} from "@/editor/editorContext.ts";

export class CirclePiece extends Drawable {

  private readonly circle = new Sprite({
    texture: Assets.get("hitcircle"),
    anchor: new Point(0.5, 0.5),
  });
  private readonly overlay = new Sprite({
    texture: Assets.get("hitcircleoverlay"),
    anchor: new Point(0.5, 0.5),
  });

  constructor() {
    super();
    this.addChild(this.circle, this.overlay);
    this.alpha = 0;
  }

  timePreempt = 0;
  timeFadeIn = 0;
  startTime = 0;

  @Inject(EditorContext)
  editor!: EditorContext;

  onTick() {
    const time = this.editor.clock.currentTimeAnimated - this.startTime;

    const {preferences} = usePreferences()

    if (time < 0) {
      this.alpha = animate(time, -this.timePreempt, -this.timePreempt + this.timeFadeIn, 0, 1);
      this.circle.tint = this.comboColor;
      this.scale.set(1)
    } else {
      if (preferences.viewport.hitAnimations) {
        this.alpha = animate(time, 0, 240, 0.9, 0);
        this.scale.set(animate(time, 0, 240, 1, 1.4, Easing.outQuad));
        this.circle.tint = this.comboColor;
      } else {
        this.alpha = animate(time, 0, 700, 0.9, 0);
        this.scale.set(1)
        this.circle.tint = 0xffffff;
      }
    }

  }

  comboColor = 0xffffff;


}