import { CompositeDrawable, resolved, Vec2 } from 'osucad-framework';
import { Skin } from '../../skins/Skin';
import { HitObject, Spinner } from '@osucad/common';
import { animate } from '../../utils/animate';
import { Easing } from 'osu-classes';
import { Sprite } from 'pixi.js';

export class FollowPointRenderer extends CompositeDrawable {
  @resolved(Skin)
  skin!: Skin;

  updateFollowPoints(objects: HitObject[]) {
    const drawNode = this.drawNode;

    let childCount = 0;

    for (let i = 0; i < objects.length - 1; i++) {
      const current = objects[i];
      const next = objects[i + 1];

      if (
        next.isNewCombo ||
        current instanceof Spinner ||
        next instanceof Spinner
      ) {
        continue;
      }

      const currentTime = this.time.current - current.startTime;
      const delta = Vec2.sub(next.position, current.endPosition);

      const padding = 32;
      const gap = 32;
      const angle = Math.atan2(delta.y, delta.x);
      const length = delta.length();

      const amount = Math.max(Math.round((length - padding * 2) / gap), 0);

      const duration = next.startTime - current.endTime;

      for (let j = 0; j < amount; j++) {
        const offset = (duration * j) / amount;

        const distance =
          padding +
          j * gap +
          animate(
            currentTime,
            offset - 600,
            offset - 400,
            -10,
            0,
            Easing.outQuad,
          );

        let sprite = drawNode.children[j + childCount] as unknown as
          | Sprite
          | undefined;
        if (!sprite) {
          sprite = new Sprite(this.skin.followPoint);
          drawNode.addChild(sprite);
        }

        sprite.anchor.set(0.5);
        sprite.scale.set(0.5);
        sprite.rotation = angle;
        sprite.position.copyFrom(
          Vec2.add(
            current.endPosition,
            Vec2.scale(delta.normalize(), distance),
          ),
        );

        if (currentTime < offset - 400) {
          sprite.alpha = animate(currentTime, offset - 600, offset - 400, 0, 1);
        } else if (currentTime < offset) {
          sprite.alpha = 1;
        } else sprite.alpha = animate(currentTime, offset, offset + 400, 1, 0);
      }

      childCount += amount;
    }

    if (drawNode.children.length > childCount) {
      drawNode.removeChildren(childCount);
    }
  }
}
