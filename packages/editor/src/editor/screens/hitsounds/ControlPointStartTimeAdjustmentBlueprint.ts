import type {
  DragEndEvent,
  DragEvent,
  DragStartEvent,
  HoverEvent,
  HoverLostEvent,
  MouseDownEvent,
} from 'osucad-framework';
import { ControlPointGroup, ControlPointInfo, CreateControlPointCommand, DifficultyPoint, EffectPoint, SamplePoint, TimingPoint, UpdateControlPointCommand } from '@osucad/common';
import {
  Anchor,
  Axes,
  Box,
  dependencyLoader,
  MouseButton,
  resolved,
} from 'osucad-framework';
import { CommandManager } from '../../context/CommandManager';
import { EditorClock } from '../../EditorClock';
import { ControlPointAdjustmentBlueprint } from './ControlPointAdjustmentBlueprint';
import { HitSoundsTimeline } from './HitSoundsTimeline';

export class ControlPointStartTimeAdjustmentBlueprint extends ControlPointAdjustmentBlueprint {
  #timeline!: HitSoundsTimeline;

  @resolved(ControlPointInfo)
  private controlPoints!: ControlPointInfo;

  @resolved(EditorClock)
  private editorClock!: EditorClock;

  @dependencyLoader()
  load() {
    this.width = 15;
    this.origin = Anchor.TopCenter;
    this.relativeSizeAxes = Axes.Y;

    this.addInternal(
      new Box({
        relativeSizeAxes: Axes.Y,
        width: 2,
        alpha: 0.2,
        anchor: Anchor.Center,
        origin: Anchor.Center,
      }),
    );
  }

  protected loadComplete() {
    super.loadComplete();

    this.#timeline = this.findClosestParentOfType(HitSoundsTimeline)!;
  }

  onHover(e: HoverEvent): boolean {
    this.internalChild.alpha = 0.5;

    return true;
  }

  onHoverLost(e: HoverLostEvent) {
    this.internalChild.alpha = 0.2;
  }

  onMouseDown(e: MouseDownEvent): boolean {
    return e.button === MouseButton.Left;
  }

  #draggedControlPoint?: ControlPointGroup;

  @resolved(CommandManager)
  private commandManager!: CommandManager;

  onDragStart(e: DragStartEvent): boolean {
    if (e.button !== MouseButton.Left)
      return false;

    const controlPoint = this.entry?.start;

    if (!controlPoint)
      return false;

    const group = controlPoint instanceof ControlPointGroup ? controlPoint : controlPoint.group;
    if (!group)
      return false;

    if (!group.timing && (group.children.size === 1 || this.controlPoint === group || e.controlPressed)) {
      this.#draggedControlPoint = group;
    }
    else {
      const controlPoint = this.controlPoint;

      const createCommand = new CreateControlPointCommand({
        time: group.time,
      });

      const updateCommand = new UpdateControlPointCommand(group, {});

      if (controlPoint instanceof TimingPoint) {
        createCommand.options.timing = controlPoint.asPatch();
        updateCommand.patch.timing = null;
      }
      else if (controlPoint instanceof SamplePoint) {
        createCommand.options.sample = controlPoint.asPatch();
        updateCommand.patch.sample = null;
      }
      else if (controlPoint instanceof EffectPoint) {
        createCommand.options.effect = controlPoint.asPatch();
        updateCommand.patch.effect = null;
      }
      else if (controlPoint instanceof DifficultyPoint) {
        createCommand.options.difficulty = controlPoint.asPatch();
        updateCommand.patch.difficulty = null;
      }

      this.commandManager.submit(updateCommand, false);
      this.commandManager.submit(createCommand, false);

      const newGroup = this.controlPoints.getById(createCommand.id);

      if (!newGroup) {
        console.warn('Failed to create control point');
        return false;
      }

      this.#draggedControlPoint = newGroup;
    }

    return true;
  }

  onDrag(e: DragEvent): boolean {
    if (!this.#draggedControlPoint || this.isDisposed)
      return false;

    const position = this.#timeline.toLocalSpace(e.screenSpaceMousePosition);

    const time = this.#timeline.timeAtPosition(position.x);

    this.commandManager.submit(
      new UpdateControlPointCommand(this.#draggedControlPoint, {
        time: this.controlPoints.snap(time, this.editorClock.beatSnapDivisor.value),
      }),
      false,
    );

    return true;
  }

  onDragEnd(e: DragEndEvent) {
    this.commandManager.commit();
  }
}
