import { Drawable } from '../Drawable.ts';
import { HitSoundLayer } from '@osucad/common';
import { Assets, Circle, Point, Sprite } from 'pixi.js';

export class HitSoundLayerToggle extends Drawable {
  constructor(private layer: HitSoundLayer) {
    super();

    this.addChild(
      new Sprite({
        texture: Assets.get('hitsound-layer-toggle'),
        anchor: new Point(0.5, 0.5),
        scale: new Point(0.1, 0.1),
      }),
    );
    this.hitArea = new Circle(0, 0, 7.5);
    this.eventMode = 'static';
    this.onpointerenter = () => this.scale.set(1.1);
    this.onpointerleave = () => this.scale.set(1);
    this.onpointerdown = () => this.toggle();
  }

  onTick() {
    this.alpha = this.layer.enabled ? 1 : 0.5;
  }

  toggle() {
    this.layer.enabled = !this.layer.enabled;
  }
}
