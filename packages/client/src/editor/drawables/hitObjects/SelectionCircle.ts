import { Assets, Container, Point, Sprite } from 'pixi.js';

export class SelectionCircle extends Container {
  constructor() {
    super({
      children: [
        new Sprite({
          texture: Assets.get('hitcircleselect'),
          anchor: new Point(0.5, 0.5),
          visible: true,
          zIndex: -10000,
        }),
      ],
    });
  }
}
