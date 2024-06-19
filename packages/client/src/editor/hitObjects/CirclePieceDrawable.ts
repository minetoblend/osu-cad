import { ContainerDrawable } from '@/framework/drawable/ContainerDrawable.ts';
import { dependencyLoader, resolved } from '@/framework/di/DependencyLoader.ts';
import { Skin } from '@/editor/skins/skin.ts';
import { DrawableSprite } from '@/framework/drawable/DrawableSprite.ts';
import { Anchor } from '@/framework/drawable/Anchor.ts';
import { EditorClock } from '@/editor/EditorClock.ts';
import { animate, Easing } from '@/editorOld/drawables/animate.ts';
import { Vec2 } from '@osucad/common';

export class CirclePieceDrawable extends ContainerDrawable {
  constructor() {
    super({
      alpha: 0,
    });
  }

  @resolved(Skin)
  skin!: Skin;

  @resolved(EditorClock)
  clock!: EditorClock;

  hitCircle!: DrawableSprite;
  hitCircleOverlay!: DrawableSprite;

  startTime = 0;
  timePreempt = 0;
  timeFadeIn = 0;

  @dependencyLoader()
  load() {
    this.hitCircle = new DrawableSprite({
      texture: this.skin.textures.hitcircle,
      origin: Anchor.Centre,
      anchor: Anchor.Centre,
    });
    this.hitCircleOverlay = new DrawableSprite({
      texture: this.skin.textures.hitcircleoverlay,
      origin: Anchor.Centre,
      anchor: Anchor.Centre,
    });
    this.addAll([this.hitCircle, this.hitCircleOverlay]);
    this.hitCircle.isPresent = false;
    this.hitCircleOverlay.isPresent = false;
  }

  comboColor = 0xffffff;

  onTick() {
    const time = this.clock.currentTimeAnimated - this.startTime;
    if (time < 0) {
      this.alpha = animate(
        time,
        -this.timePreempt,
        -this.timePreempt + this.timeFadeIn,
        0,
        1,
      );
      this.hitCircle.color = this.comboColor;
      this.scale = new Vec2(1);

      this.hitCircle.isPresent = true;
      this.hitCircleOverlay.isPresent = true;
      // this.hitMarker.visible = false;
    } else {
      this.alpha = animate(time, 0, 700, 0.9, 0, Easing.inQuad);
      this.hitCircle.color = 0xffffff;
      this.scale = new Vec2(1);

      this.hitCircle.isPresent = true;
      this.hitCircleOverlay.isPresent = true;
      // this.hitMarker.visible = false;
    }
  }
}
