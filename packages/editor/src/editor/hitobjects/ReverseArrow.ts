import {
  Anchor,
  CompositeDrawable,
  DrawableSprite,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import { animate } from '../../utils/animate';
import { EditorClock } from '../EditorClock';
import { Skin } from '../../skins/Skin';

export class ReverseArrow extends CompositeDrawable {
  constructor() {
    super();
  }

  @resolved(Skin)
  skin!: Skin;

  @dependencyLoader()
  load() {
    this.addInternal(
      new DrawableSprite({
        texture: this.skin.reverseArrow,
        origin: Anchor.Center,
      }),
    );
  }

  get alwaysPresent(): boolean {
    return true;
  }

  startTime = 0;
  timePreempt = 0;

  @resolved(EditorClock)
  editorClock!: EditorClock;

  update() {
    super.update();

    const time = this.time.current - this.startTime;

    if (time < 0) {
      this.alpha = animate(
        time,
        -this.timePreempt,
        -this.timePreempt + 150,
        0,
        1,
      );
      this.scale = 1.2 - this.editorClock.beatProgress * 0.2;
    }
    else {
      this.alpha = animate(time, 0, 150, 1, 0);
      this.scale = animate(time, 0, 150, 1, 2);
    }
  }
}
