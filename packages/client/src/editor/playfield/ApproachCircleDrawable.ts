import { ContainerDrawable } from '@/framework/drawable/ContainerDrawable.ts';
import { dependencyLoader, resolved } from '@/framework/di/DependencyLoader.ts';
import { DrawableSprite } from '@/framework/drawable/DrawableSprite.ts';
import { Skin } from '@/editor/skins/skin.ts';
import { Anchor } from '@/framework/drawable/Anchor.ts';
import { EditorClock } from '@/editor/EditorClock.ts';
import { animate } from '@/editorOld/drawables/animate.ts';
import { Vec2 } from '@osucad/common';

export class ApproachCircleDrawable extends ContainerDrawable {
  constructor() {
    super({
      alpha: 0,
    });
  }

  approachCircle!: DrawableSprite;

  timePreempt = 0;
  startTime = 0;

  @resolved(EditorClock)
  clock!: EditorClock;

  @dependencyLoader()
  load() {
    const skin = this.dependencies.resolve(Skin);

    this.approachCircle = this.add(
      new DrawableSprite({
        texture: skin.textures.approachcircle,
        origin: Anchor.Centre,
        anchor: Anchor.Centre,
      }),
    );
  }

  set comboColor(value: number) {
    this.approachCircle.color = value;
  }

  onTick() {
    const time = this.clock.currentTimeAnimated - this.startTime;
    if (time < 0) {
      this.scale = new Vec2(animate(time, -this.timePreempt, 0, 4, 1));
      this.alpha = animate(time, -this.timePreempt, 0, 0, 1);
    } else {
      this.scale = new Vec2(animate(time, 0, 100, 1, 1.1));
      this.alpha = animate(time, 0, 700, 1, 0);
    }
  }
}
