import type { ClickEvent, DragEndEvent, DragEvent, DragStartEvent, MouseDownEvent } from 'osucad-framework';
import type { KiaiSelectionBlueprint } from './KiaiSelectionBlueprint';
import { Axes, Box, MouseButton, resolved } from 'osucad-framework';
import { ControlPointInfo } from '../../../../controlPoints/ControlPointInfo';
import { UpdateHandler } from '../../../../crdt/UpdateHandler';
import { EditorClock } from '../../../EditorClock';
import { Timeline } from '../../../ui/timeline/Timeline';
import { TimingScreenSelectionManager } from '../TimingScreenSelectionManager';

export class KiaiSelectionBody extends Box {
  constructor(readonly blueprint: KiaiSelectionBlueprint) {
    super({
      relativeSizeAxes: Axes.Both,
      color: 0x40F589,
      alpha: 0.5,
    });
  }

  @resolved(Timeline)
  protected timeline!: Timeline;

  protected get controlPoint() {
    return this.blueprint.controlPoint;
  }

  #dragOffset = 0;

  @resolved(ControlPointInfo)
  controlPointInfo!: ControlPointInfo;

  @resolved(EditorClock)
  protected editorClock!: EditorClock;

  @resolved(TimingScreenSelectionManager)
  protected selectionManager!: TimingScreenSelectionManager;

  @resolved(UpdateHandler)
  protected updateHandler!: UpdateHandler;

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left)
      return true;

    if (e.button === MouseButton.Right) {
      const { start, end } = this.blueprint.entry!;
      this.controlPointInfo.remove(start);
      if (end)
        this.controlPointInfo.remove(end);
      this.updateHandler.commit();

      return true;
    }

    return false;
  }

  override onDragStart(e: DragStartEvent): boolean {
    this.#dragOffset = this.timeline.screenSpacePositionToTime(e.screenSpaceMousePosition) - this.controlPoint!.time;

    return true;
  }

  override onDrag(e: DragEvent): boolean {
    let time = this.timeline.screenSpacePositionToTime(e.screenSpaceMousePosition) - this.#dragOffset;

    if (!e.shiftPressed)
      time = this.controlPointInfo.snap(time, this.editorClock.beatSnapDivisor.value);

    const delta = time - this.controlPoint!.time;

    this.blueprint.entry!.start.time += delta;
    if (this.blueprint.entry!.end)
      this.blueprint.entry!.end.time += delta;

    return true;
  }

  override onDragEnd(e: DragEndEvent) {
    this.updateHandler.commit();
  }

  override onClick(e: ClickEvent): boolean {
    this.selectionManager.setSelection(
      ...this.blueprint.entry?.end
        ? [this.blueprint.entry!.start, this.blueprint.entry!.end!]
        : [this.blueprint.entry!.start],
    );
    return true;
  }
}
