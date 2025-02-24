import { Anchor, Axes, CompositeDrawable, DrawableSprite } from '@osucad/framework';
import { getIcon } from '@osucad/resources';
import { Color } from 'pixi.js';

export class ArgonFollowPoint extends CompositeDrawable {
  constructor() {
    super();

    this.blendMode = 'add';
    this.color = 0xFC618F;
    this.autoSizeAxes = Axes.Both;

    this.internalChildren = [
      new DrawableSprite({
        texture: getIcon('caret-left'),
        size: 12,
        color: new Color([0.2, 0.2, 0.2]),
        origin: Anchor.Center,
        rotation: Math.PI,
      }),
      new DrawableSprite({
        texture: getIcon('caret-left'),
        size: 12,
        x: 4,
        origin: Anchor.Center,
        rotation: Math.PI,
      }),
    ];
  }
}
