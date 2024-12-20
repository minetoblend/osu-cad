import type { DragEndEvent, DragEvent, DragStartEvent } from 'osucad-framework';
import type { OsuHitObject } from '../hitObjects/OsuHitObject';
import { CompositeDrawable, dependencyLoader, Rectangle, resolved, RoundedBox, Vec2 } from 'osucad-framework';
import { EditorClock } from '../../../editor/EditorClock';
import { OsucadColors } from '../../../OsucadColors';
import { HitCircle } from '../hitObjects/HitCircle';
import { Slider } from '../hitObjects/Slider';
import { OsuPlayfield } from '../ui/OsuPlayfield';

export class OsuSelectBox extends CompositeDrawable {
  #box!: RoundedBox;

  @resolved(OsuPlayfield)
  playfield!: OsuPlayfield;

  @dependencyLoader()
  [Symbol('load')]() {
    this.addInternal(
      this.#box = new RoundedBox({
        fillAlpha: 0,
        alpha: 0,
        cornerRadius: 1,
        outlines: [{
          width: 1,
          color: OsucadColors.primary,
        }],
      }),
    );
  }

  #dragStartPosition = new Vec2();

  override onDragStart(e: DragStartEvent): boolean {
    this.#dragStartPosition = e.mousePosition;
    this.#box.size = 0;
    return true;
  }

  @resolved(EditorClock)
  editorClock!: EditorClock;

  override onDrag(e: DragEvent): boolean {
    const min = e.mousePosition.componentMin(this.#dragStartPosition);
    const max = e.mousePosition.componentMax(this.#dragStartPosition);

    const size = max.sub(min);

    if (size.lengthSq() < 1)
      this.#box.alpha = 0;
    else
      this.#box.alpha = 1;

    this.#box.position = min;
    this.#box.size = size;

    const rect = new Rectangle(min.x, min.y, size.x, size.y);

    const objects = this.playfield.allHitObjects
      .map(it => it.hitObject!)
      .filter((hitObject) => {
        if (!(hitObject as OsuHitObject).isVisibleAtTime(this.editorClock.currentTime))
          return false;

        if (hitObject instanceof HitCircle)
          return rect.contains(hitObject.stackedPosition);
        if (hitObject instanceof Slider)
          return rect.contains(hitObject.stackedPosition) || rect.contains(hitObject.stackedPosition.add(hitObject.path.endPosition));
        return false;
      });

    return true;
  }

  override onDragEnd(e: DragEndEvent) {
    this.#box.hide();
  }

  override receivePositionalInputAt(screenSpacePosition: Vec2): boolean {
    return true;
  }
}
