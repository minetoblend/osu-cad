import {EditorInstance} from "../../../createEditor";
import {Container, Sprite, Texture} from "pixi.js";

import hitcirclepng from "@/assets/skin/hitcircle@2x.png";
import hitcircleoverlaypng from "@/assets/skin/hitcircleoverlay@2x.png";

export class DrawableCirclePiece extends Container {
  hitCircle: Sprite;
  hitCircleOverlay: Sprite;

  constructor(private editor: EditorInstance) {
    super();

    const hitCircle = new Sprite(Texture.from(hitcirclepng));
    hitCircle.anchor.set(0.5);
    this.addChild(hitCircle);
    this.hitCircle = hitCircle;

    const hitCircleOverlay = new Sprite(Texture.from(hitcircleoverlaypng));
    hitCircleOverlay.anchor.set(0.5);
    this.addChild(hitCircleOverlay);
    this.hitCircleOverlay = hitCircleOverlay;
  }

  update() {}

  set tint(value: number) {
    this.hitCircle.tint = value;
  }

  set outlineTint(value: number) {
    this.hitCircleOverlay.tint = value;
  }
}
