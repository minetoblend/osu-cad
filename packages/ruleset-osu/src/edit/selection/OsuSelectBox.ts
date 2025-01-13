import type { DragEndEvent, DragEvent, DragStartEvent } from 'osucad-framework';
import type { OsuHitObject } from '../../hitObjects/OsuHitObject';
import { EditorClock, HitObjectSelectionManager, OsucadColors } from '@osucad/common';
import { CompositeDrawable, dependencyLoader, Rectangle, resolved, RoundedBox, Vec2 } from 'osucad-framework';
import { HitCircle } from '../../hitObjects/HitCircle';
import { Slider } from '../../hitObjects/Slider';
import { OsuPlayfield } from '../../ui/OsuPlayfield';

export class OsuSelectBox extends CompositeDrawable {
  #box!: RoundedBox;

  @resolved(OsuPlayfield)
  playfield!: OsuPlayfield;

  @resolved(HitObjectSelectionManager)
  selection!: HitObjectSelectionManager<OsuHitObject>;

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
    this.#multiTouchDrag = false;
    this.#lastTouchPosition = undefined;
    return true;
  }

  @resolved(EditorClock)
  editorClock!: EditorClock;

  #multiTouchDrag = false;

  #lastTouchPosition?: Vec2;

  override onDrag(e: DragEvent): boolean {
    if (e.touchCount > 1 || this.#multiTouchDrag) {
      this.#multiTouchDrag = true;
      this.#box.hide();

      const touchPosition = new Vec2();
      for (const touch of e.state.touch.activeSources.pressedButtons)
        touchPosition.addInPlace(e.state.touch.getTouchPosition(touch) ?? Vec2.zero());
      touchPosition.scaleInPlace(1 / e.touchCount);

      if (this.#lastTouchPosition) {
        const delta = this.toLocalSpace(touchPosition).sub(this.toLocalSpace(this.#lastTouchPosition));

        this.editorClock.seek(
          this.editorClock.currentTimeAccurate - delta.x * 5,
          true,
        );
      }

      this.#lastTouchPosition = touchPosition;

      return false;
    }

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

    this.selection.setSelection(...objects as OsuHitObject[]);

    return true;
  }

  override onDragEnd(e: DragEndEvent) {
    this.#box.hide();

    if (this.#multiTouchDrag)
      this.editorClock.seekSnapped(this.editorClock.currentTimeAccurate);
  }

  override receivePositionalInputAt(screenSpacePosition: Vec2): boolean {
    return true;
  }
}
