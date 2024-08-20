import type { HitObject } from '@osucad/common';
import { Beatmap, DeleteHitObjectCommand, UpdateHitObjectCommand } from '@osucad/common';
import type {
  DragEvent,
  MouseDownEvent,
  MouseUpEvent,
  Vec2,
} from 'osucad-framework';
import { Anchor, Axes, Container, MouseButton, dependencyLoader, resolved } from 'osucad-framework';
import type { ColorSource } from 'pixi.js';
import { EditorClock } from '../EditorClock';
import { ThemeColors } from '../ThemeColors';
import { CommandManager } from '../context/CommandManager';
import { EditorSelection } from '../screens/compose/EditorSelection';
import { Editor } from '../Editor';
import { Timeline } from './Timeline';
import { TimelineElement } from './TimelineElement';

export abstract class TimelineObject<T extends HitObject = HitObject> extends Container {
  protected constructor(readonly hitObject: T) {
    super({
      relativeSizeAxes: Axes.Y,
      height: 0.5,
      anchor: Anchor.CenterLeft,
      origin: Anchor.CenterLeft,
    });
  }

  protected body!: TimelineElement;

  @resolved(ThemeColors)
  protected theme!: ThemeColors;

  protected timeline!: Timeline;

  @resolved(Beatmap)
  protected beatmap!: Beatmap;

  @dependencyLoader()
  [Symbol('load')]() {
    this.add(this.body = new TimelineElement());

    this.body.body.alpha = 0.8;

    this.hitObject.onUpdate.addListener(() => this.setup());

    this.selection.selectionChanged.addListener(([hitObject, selected]) => {
      if (hitObject !== this.hitObject)
        return;

      this.selectionChanged(selected);
    });
  }

  protected loadComplete() {
    super.loadComplete();

    this.timeline = this.findClosestParentOfType(Timeline)!;
    if (!this.timeline) {
      throw new Error('RhythmTimelineObject must be a child of RhythmTimeline');
    }

    this.setup();

    this.selectionChanged(this.hitObject.isSelected);
  }

  setup() {
    this.body.bodyColor = this.hitObject.comboColor;
  }

  protected selectionChanged(selected: boolean) {
    this.body.selected = selected;
  }

  update() {
    super.update();

    const radius = this.drawSize.y * 0.5;
    this.x = this.timeline.timeToPosition(this.hitObject.startTime) - radius;
    this.width = this.timeline.durationToSize(this.hitObject.duration) + radius * 2;
  }

  protected applyComboColor(color: ColorSource) {
    this.body.bodyColor = color;
  }

  @resolved(EditorSelection)
  selection!: EditorSelection;

  @resolved(CommandManager)
  commandManager!: CommandManager;

  @resolved(EditorClock)
  editorClock!: EditorClock;

  onMouseDown(e: MouseDownEvent): boolean {
    switch (e.button) {
      case MouseButton.Left:
        this.selectFromMouseDown(e);

        this.#dragOffset = this.hitObject.startTime
        - this.timeline.positionToTime(
          this.timeline.toLocalSpace(e.screenSpaceMousePosition).x,
        );
        this.#lastTime = this.hitObject.startTime;
        return true;
      case MouseButton.Right:
        if (!this.hitObject.isSelected)
          this.selection.select([this.hitObject]);

        for (const hitObject of this.selection.selectedObjects) {
          this.commandManager.submit(
            new DeleteHitObjectCommand(hitObject),
            false,
          );
        }
        this.commandManager.commit();
        return true;
    }

    return false;
  }

  #dragOffset = 0;

  #lastTime = 0;

  protected selectFromMouseDown(e: MouseDownEvent) {
    if (e.controlPressed) {
      if (
        this.selection.length <= 1
        || !this.selection.isSelected(this.hitObject)
      ) {
        this.selection.select([this.hitObject], true);
        return true;
      }

      this.selection.deselect(this.hitObject);
      this.findClosestParentOfType(Editor)?.requestSelectTool.emit();

      return true;
    }

    if (!this.selection.isSelected(this.hitObject)) {
      this.selection.select([this.hitObject]);
      this.findClosestParentOfType(Editor)?.requestSelectTool.emit();
    }
  }

  onDragStart(event: MouseUpEvent): boolean {
    return event.button === MouseButton.Left;
  }

  onDrag(event: DragEvent): boolean {
    const parent = this.findClosestParentOfType(Timeline);
    if (!parent) {
      throw new Error('RhythmTimelineStartCircle must be a child of Timeline');
    }
    const time = parent.positionToTime(
      parent.toLocalSpace(event.screenSpaceMousePosition).x,
    ) + this.#dragOffset;

    const snappedTime = this.beatmap.controlPoints.snap(
      time,
      this.editorClock.beatSnapDivisor.value,
    );

    const delta = snappedTime - this.#lastTime;
    this.#lastTime = snappedTime;

    if (delta !== 0) {
      for (const hitObject of this.selection.selectedObjects) {
        this.commandManager.submit(
          new UpdateHitObjectCommand(hitObject, {
            startTime: hitObject.startTime + delta,
          }),
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

  contains(screenSpacePosition: Vec2): boolean {
    return this.body.contains(screenSpacePosition);
  }
}
