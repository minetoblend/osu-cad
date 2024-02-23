import { Drawable } from '../Drawable.ts';
import { Assets, Point, Sprite } from 'pixi.js';
import { Inject } from '../di';
import { animate } from '../animate.ts';
import { EditorContext } from '@/editor/editorContext.ts';

export class SliderBallDrawable extends Drawable {
  sliderb0 = new Sprite({
    texture: Assets.get('sliderb0'),
    anchor: new Point(0.5, 0.5),
  });
  followCircle = new Sprite({
    texture: Assets.get('sliderfollowcircle'),
    anchor: new Point(0.5, 0.5),
  });

  startTime = 0;
  endTime = 0;

  onLoad() {
    this.addChild(this.sliderb0, this.followCircle);
    this.visible = false;
  }

  @Inject(EditorContext)
  editor!: EditorContext;

  onTick() {
    const time = this.editor.clock.currentTimeAnimated - this.startTime;
    const duration = this.endTime - this.startTime;

    const fadeDuration = Math.min(150, duration);

    this.visible = time > 0 && time < duration + fadeDuration;
    if (time < fadeDuration) {
      this.followCircle.scale.set(animate(time, 0, fadeDuration, 0.5, 1));
      this.followCircle.alpha = animate(time, 0, fadeDuration, 0.5, 1);
    } else if (time < duration) {
      this.followCircle.scale.set(1);
      this.followCircle.alpha = 1;
    } else {
      this.followCircle.scale.set(
        animate(time, duration, duration + fadeDuration, 1, 0.5),
      );
      this.followCircle.alpha = animate(
        time,
        duration,
        duration + fadeDuration,
        1,
        0,
      );
    }

    this.sliderb0.visible = time > 0 && time < duration;
  }
}
