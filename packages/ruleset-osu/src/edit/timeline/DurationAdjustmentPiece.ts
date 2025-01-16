import type { HitObject, IHasDuration } from '@osucad/core';
import type { DragEndEvent, DragEvent, DragStartEvent } from '@osucad/framework';
import type { OsuTimelineHitObjectBlueprint } from './OsuTimelineHitObjectBlueprint';
import { EditorClock, Timeline } from '@osucad/core';
import { resolved } from '@osucad/framework';
import { UpdateHandler } from '@osucad/multiplayer';
import { TimelineHitObjectTail } from './TimelineHitObjectTail';

export class DurationAdjustmentPiece extends TimelineHitObjectTail {
  constructor(blueprint: OsuTimelineHitObjectBlueprint, readonly hitObject: Omit<HitObject, 'duration'> & IHasDuration) {
    super(blueprint);
  }

  @resolved(UpdateHandler)
  updateHandler!: UpdateHandler;

  @resolved(Timeline)
  timeline!: Timeline;

  @resolved(EditorClock)
  editorClock!: EditorClock;

  #dragOffset = 0;

  override onDragStart(e: DragStartEvent): boolean {
    if (this.blueprint.readonly)
      return false;

    this.#dragOffset = this.timeline.screenSpacePositionToTime(e.screenSpaceMousePosition) - this.hitObject.startTime;
    return true;
  }

  override onDrag(e: DragEvent): boolean {
    let time = this.timeline.screenSpacePositionToTime(e.screenSpaceMousePosition) - this.#dragOffset;

    if (!e.shiftPressed) {
      time = this.editorClock.snap(time);
    }

    this.hitObject.duration = time - this.hitObject.startTime;

    return true;
  }

  override onDragEnd(e: DragEndEvent) {
    this.updateHandler.commit();
  }
}
