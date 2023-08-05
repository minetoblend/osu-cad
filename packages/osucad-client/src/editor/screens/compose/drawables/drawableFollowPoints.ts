import {Container, Sprite, Texture} from "pixi.js";
import {Vec2, HitObject} from "@osucad/common";
import {animate, Easing} from "@/utils/animate";

import followPointPng from "@/assets/skin/followpoint@2x.png";
import {EditorClock} from "@/editor/clock";
import {watch} from "vue";

const followPointTexture = Texture.from(followPointPng);

export class DrawableFollowPoints extends Container <Sprite> {

  constructor(
    public start: HitObject,
    public end: HitObject,
    public clock: EditorClock,
  ) {
    super();

    watch([() => this.start.endPosition, () => this.end.position, () => this.start.startTime, () => this.end.startTime, () => this.end.newCombo], () => {
      this.update(clock.currentTimeAnimated);
    });
  }

  update(currentTime: number) {
    this.visible = !this.end.newCombo;
    if (this.end.newCombo) return;

    const startPos = this.start.endPosition;
    const endPos = this.end.position;

    currentTime -= this.start.startTime;

    const delta = Vec2.sub(endPos, startPos);

    const padding = 32;
    const gap = 32;
    const angle = Math.atan2(delta.y, delta.x);
    const length = Vec2.length(delta);

    const amount = Math.round((length - padding * 2) / gap);

    const duration = this.end.startTime - this.start.startTime;

    this.children.slice(amount).forEach((sprite) => {
      sprite.destroy();
    });

    for (let i = 0; i < amount; i++) {

      const offset = duration * i / amount;

      const distance =
        padding + i * gap + animate(currentTime, offset - 600, offset - 400, -10, 0, Easing.outQuad);

      let sprite = this.children[i];
      if (!sprite) {
        sprite = new Sprite(followPointTexture);
        this.addChild(sprite);
      }

      sprite.anchor.set(0.5);
      sprite.scale.set(0.5);
      sprite.rotation = angle;
      sprite.position.copyFrom(
        Vec2.add(startPos, Vec2.scale(Vec2.normalize(delta), distance)),
      );

      if (currentTime < offset)
        sprite.alpha = animate(currentTime, offset - 600, offset - 400, 0, 1);
      else if (currentTime < offset)
        sprite.alpha = 1;
      else
        sprite.alpha = animate(currentTime, offset, offset + 400, 1, 0);

    }
  }

}