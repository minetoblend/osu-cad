import { Drawable } from '../Drawable.ts';
import { Assets, Circle, Sprite } from 'pixi.js';
import { Inject } from '../di';
import { EditorClock } from '../../clock.ts';
import { animate } from '../animate.ts';
import { HitSoundSample } from '@osucad/common';

export class HitSampleDrawable extends Drawable {
  expandable = new Sprite({
    texture: Assets.get('hitsample-outline'),
    anchor: { x: 0.5, y: 0.5 },
    scale: { x: 0.5, y: 0.5 },
    alpha: 0,
  });

  sprite = new Sprite({
    texture: Assets.get('hitsample'),
    anchor: { x: 0.5, y: 0.5 },
    scale: { x: 0.5, y: 0.5 },
  });

  outline = new Sprite({
    texture: Assets.get('hitsample-outline'),
    anchor: { x: 0.5, y: 0.5 },
    scale: { x: 0.5, y: 0.5 },
    alpha: 1,
  });

  constructor(private readonly sample: HitSoundSample) {
    super();
    this.addChild(this.expandable, this.outline, this.sprite);
    this.hitArea = new Circle(0, 0, 10);
    this.on(
      'pointerdown',
      () => (this.sample.selected = !this.sample.selected),
    );
    this.eventMode = 'dynamic';
  }

  time: number = 0;

  color = 0xffffff;

  @Inject(EditorClock)
  private clock!: EditorClock;

  selected = Math.random() > 0.5;

  onTick() {
    const time = this.clock.currentTime - this.time;

    this.sprite.tint = this.color;
    this.expandable.tint = this.color;
    this.outline.tint = this.sample.selected ? 0xffffff : this.color;

    if (time < 0) {
      this.expandable.visible = false;
    } else {
      this.expandable.visible = true;
      this.expandable.scale.set(animate(time, 0, 200, 0.75, 1.5));
      this.expandable.alpha = animate(time, 0, 200, 1, 0);
    }
  }
}
