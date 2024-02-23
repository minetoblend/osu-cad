import { Assets, Point, Sprite } from 'pixi.js';
import { Drawable } from '../Drawable.ts';
import { Inject } from '../di';
import { animate } from '../animate.ts';
import { usePreferences } from '@/composables/usePreferences.ts';
import { EditorContext } from '@/editor/editorContext.ts';

export class ApproachCircle extends Drawable {
  private sprite = new Sprite({
    texture: Assets.get('approachcircle'),
    anchor: new Point(0.5, 0.5),
  });

  timePreempt = 0;
  startTime = 0;

  constructor() {
    super();
    this.addChild(this.sprite);
    this.alpha = 0;
  }

  @Inject(EditorContext)
  editor!: EditorContext;

  onLoad() {
    this.onTick();
  }

  onTick() {
    const time = this.editor.clock.currentTimeAnimated - this.startTime;

    if (time < 0) {
      this.scale.set(animate(time, -this.timePreempt, 0, 4, 1));
      this.alpha = animate(time, -this.timePreempt, 0, 0, 1);
    } else {
      const { nonReactivePreferences } = usePreferences();
      if (nonReactivePreferences.viewport.hitAnimations) {
        this.alpha = 0;
      } else {
        this.scale.set(animate(time, 0, 100, 1, 1.1));
        this.alpha = animate(time, 0, 700, 1, 0);
      }
    }
  }
}
