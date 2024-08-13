import type {
  DragEvent,
  DragStartEvent,
  MouseDownEvent,
} from 'osucad-framework';
import {
  Anchor,
  FillMode,
  MouseButton,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import type { SerializedSlider, Slider } from '@osucad/common';
import { Beatmap, UpdateHitObjectCommand } from '@osucad/common';
import { EditorClock } from '../EditorClock';
import { CommandManager } from '../context/CommandManager';
import { SliderUtils } from '../screens/compose/tools/SliderUtils';
import { EditorSelection } from '../screens/compose/EditorSelection';
import { TimelineElement } from './TimelineElement';
import { Timeline } from './Timeline';
import { TimelineSlider } from './TimelineSlider';

export class TimelineSliderTail extends TimelineElement {
  constructor(readonly hitObject: Slider) {
    super({
      bodyColor: hitObject.comboColor,
      fillMode: FillMode.Fit,
    });

    this.apply({
      anchor: Anchor.CenterRight,
      origin: Anchor.CenterRight,
    });
  }

  @dependencyLoader()
  load() {
  }

  @resolved(EditorClock)
  editorClock!: EditorClock;

  @resolved(Beatmap)
  beatmap!: Beatmap;

  @resolved(CommandManager)
  commandManager!: CommandManager;

  onDragStart(event: DragStartEvent): boolean {
    if (this.findClosestParentOfType(TimelineSlider)!.mouseDownWasHead) {
      return false;
    }

    if (event.button === MouseButton.Left) {
      this.applyState();

      return true;
    }

    return false;
  }

  onDrag(event: DragEvent): boolean {
    const parent = this.findClosestParentOfType(Timeline);
    if (!parent) {
      throw new Error('SliderEndCircle must be a child of RhythmTimeline');
    }

    const time = parent.positionToTime(
      parent.toLocalSpace(event.screenSpaceMousePosition).x,
    );

    if (!event.shiftPressed) {
      const spans = Math.round(
        (time - this.hitObject.startTime) / this.hitObject.spanDuration,
      );

      this.commandManager.submit(
        new UpdateHitObjectCommand(this.hitObject, {
          repeats: Math.max(0, spans - 1),
        } as Partial<SerializedSlider>),
        false,
      );
    }
    else {
      const endTime = this.beatmap.controlPoints.snap(
        time,
        this.editorClock.beatSnapDivisor.value,
      );
      const targetDuration = endTime - this.hitObject.startTime;

      const velocityOverride
        = ((this.hitObject.velocity / this.hitObject.baseVelocity)
        * this.hitObject.duration)
        / targetDuration;

      if (velocityOverride > 0 && Number.isFinite(velocityOverride)) {
        this.commandManager.submit(
          new UpdateHitObjectCommand(this.hitObject, {
            velocity: velocityOverride,
          } as Partial<SerializedSlider>),
          false,
        );
      }
    }
    return true;
  }

  onDragEnd(): boolean {
    this.commandManager.commit();

    return true;
  }

  onHover(): boolean {
    this.applyState();
    return true;
  }

  onHoverLost(): boolean {
    this.applyState();
    return true;
  }

  protected applyState() {
    this.overlay.alpha = (this.isHovered || this.isDragged) ? 0.25 : 0;
  }

  get edgeSelected() {
    return this.#edgeSelected;
  }

  set edgeSelected(value: boolean) {
    if (this.#edgeSelected === value)
      return;

    this.#edgeSelected = value;

    this.selectionColor = value
      ? 0xF21D1D
      : this.theme.selection;
  }

  #edgeSelected = false;

  @resolved(EditorSelection)
  protected selection!: EditorSelection;

  onMouseDown(e: MouseDownEvent): boolean {
    if (this.findClosestParentOfType(TimelineSlider)!.mouseDownWasHead) {
      return false;
    }

    if (e.button === MouseButton.Left) {
      if (!this.hitObject.isSelected) {
        return false;
      }

      const edges = new Set([this.hitObject.repeats + 1]);

      this.selection.setSelectedEdges(
        this.hitObject,
        [...SliderUtils.calculateEdges(this.hitObject.selectedEdges, edges, e.controlPressed)],
      );

      return true;
    }

    return false;
  }
}
