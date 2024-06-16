import { Assets, Sprite } from 'pixi.js';
import { HitObject, Spinner, Vec2 } from '@osucad/common';
import { Inject } from '../di';
import { EditorClock } from '../../clock.ts';
import { animate, Easing } from '../animate.ts';
import { Drawable } from '../Drawable.ts';

export class FollowPointsDrawable extends Drawable {
  private readonly texture = Assets.get('followpoint');

  @Inject(EditorClock)
  clock!: EditorClock;

  constructor(
    public start: HitObject,
    public end: HitObject,
  ) {
    super();
    // this.enableRenderGroup();
  }

  onTick() {
    if (this.end.isNewCombo || this.end instanceof Spinner) {
      this.visible = false;
      return;
    }
    this.visible = true;

    // const startPos = Vec2.add(
    //   this.start.depthInfo.position,
    //   Vec2.scale(Vec2.sub(this.start.endPosition, this.start.position), this.start.depthInfo.scale),
    // );
    // const endPos = this.end.depthInfo.position;
    const startPos = this.start.endPosition;
    const endPos = this.end.position;

    const currentTime = this.clock.currentTimeAnimated - this.start.startTime;
    const delta = Vec2.sub(endPos, startPos);

    const padding = 32;
    const gap = 32;
    const angle = Math.atan2(delta.y, delta.x);
    const length = delta.length();

    const amount = Math.round((length - padding * 2) / gap);

    const duration = this.end.startTime - this.start.startTime;

    for (let i = 0; i < this.children.length; i++) {
      this.children[i].visible = i < amount;
    }

    for (let i = 0; i < amount; i++) {
      const offset = (duration * i) / amount;

      const distance =
        padding +
        i * gap +
        animate(
          currentTime,
          offset - 600,
          offset - 400,
          -10,
          0,
          Easing.outQuad,
        );

      let sprite = this.children[i] as Sprite | undefined;
      if (!sprite) {
        sprite = new Sprite(this.texture);
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
      else if (currentTime < offset) sprite.alpha = 1;
      else sprite.alpha = animate(currentTime, offset, offset + 400, 1, 0);
    }
  }
}
