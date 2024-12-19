import type { DragEndEvent, DragEvent, DragStartEvent } from 'osucad-framework';
import type { HitObject } from '../../../../hitObjects/HitObject';
import type { IHasSliderVelocity } from '../../../../hitObjects/IHasSliderVelocity';
import type { TimelineHitObjectBlueprint } from './TimelineHitObjectBlueprint';
import { resolved } from 'osucad-framework';
import { UpdateHandler } from '../../../../crdt/UpdateHandler';
import { hasRepeats } from '../../../../hitObjects/IHasRepeats';
import { EditorClock } from '../../../EditorClock';
import { Timeline } from '../Timeline';
import { TimelineHitObjectTail } from './TimelineHitObjectTail';

export class SliderVelocityAdjustmentPiece extends TimelineHitObjectTail {
  constructor(blueprint: TimelineHitObjectBlueprint, readonly hitObject: HitObject & IHasSliderVelocity) {
    super(blueprint);
  }

  #dragOffset = 0;

  @resolved(Timeline)
  timeline!: Timeline;

  @resolved(EditorClock)
  editorClock!: EditorClock;

  #dragStartVelocity: number | null = null;

  #dragStartRepeats = 0;

  override onDragStart(e: DragStartEvent): boolean {
    this.#dragOffset = this.timeline.screenSpacePositionToTime(e.screenSpaceMousePosition) - this.hitObject.endTime;

    this.#dragStartVelocity = this.hitObject.sliderVelocityOverride;
    if (hasRepeats(this.hitObject))
      this.#dragStartRepeats = this.hitObject.repeatCount;

    return true;
  }

  override onDrag(e: DragEvent): boolean {
    let time = this.timeline.screenSpacePositionToTime(e.screenSpaceMousePosition) - this.#dragOffset;

    if (hasRepeats(this.hitObject)) {
      if (!e.shiftPressed) {
        this.hitObject.sliderVelocityOverride = this.#dragStartVelocity;

        const numSpans = Math.round(
          (time - this.hitObject.startTime) / this.hitObject.spanDuration,
        );

        this.hitObject.repeatCount = Math.max(0, numSpans - 1);

        return true;
      }

      this.hitObject.repeatCount = this.#dragStartRepeats;
      time = this.editorClock.snap(time);
    }
    else if (!e.shiftPressed) {
      time = this.editorClock.snap(time);
    }

    const targetDuration = Math.max(0, time - this.hitObject.startTime);

    const velocity = ((this.hitObject.sliderVelocity / this.hitObject.baseVelocity)
      * this.hitObject.duration)
      / targetDuration;

    if (velocity > 0 && Number.isFinite(velocity))
      this.hitObject.sliderVelocityOverride = velocity;

    return true;
  }

  @resolved(UpdateHandler)
  updateHandler!: UpdateHandler;

  override onDragEnd(e: DragEndEvent) {
    this.updateHandler.commit();
  }
}
