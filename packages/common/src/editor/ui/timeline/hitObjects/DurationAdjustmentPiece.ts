import type { DragEndEvent, DragEvent, DragStartEvent } from 'osucad-framework';
import type { HitObject } from '../../../../hitObjects/HitObject';
import type { IHasDuration } from '../../../../hitObjects/IHasDuration';
import type { TimelineHitObjectBlueprint } from './TimelineHitObjectBlueprint';
import { resolved } from 'osucad-framework';
import { UpdateHandler } from '../../../../crdt/UpdateHandler';
import { EditorClock } from '../../../EditorClock';
import { Timeline } from '../Timeline';
import { TimelineHitObjectTail } from './TimelineHitObjectTail';

export class DurationAdjustmentPiece extends TimelineHitObjectTail {
  constructor(blueprint: TimelineHitObjectBlueprint, readonly hitObject: Omit<HitObject, 'duration'> & IHasDuration) {
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
