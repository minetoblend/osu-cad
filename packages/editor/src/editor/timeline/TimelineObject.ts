import type { OsuHitObject } from '@osucad/common';
import type { DragEvent, MouseDownEvent, MouseUpEvent, Vec2 } from 'osucad-framework';
import type { ColorSource } from 'pixi.js';
import { Beatmap, DeleteHitObjectCommand, OsucadConfigManager, OsucadSettings, UpdateHitObjectCommand } from '@osucad/common';
import { Anchor, BindableBoolean, Cached, Container, dependencyLoader, EasingFunction, Invalidation, InvalidationSource, MouseButton, resolved } from 'osucad-framework';
import { CommandManager } from '../context/CommandManager';
import { Editor } from '../Editor';
import { EditorClock } from '../EditorClock';
import { EditorSelection } from '../screens/compose/EditorSelection';
import { ThemeColors } from '../ThemeColors';
import { ComposeScreenTimeline } from './ComposeScreenTimeline';
import { Timeline } from './Timeline';
import { TimelineElement } from './TimelineElement';

export abstract class TimelineObject<T extends OsuHitObject = OsuHitObject> extends Container {
  protected constructor(readonly hitObject: T) {
    super({
      height: 40,
      anchor: Anchor.CenterLeft,
      origin: Anchor.CenterLeft,
    });
  }

  protected body!: TimelineElement;

  @resolved(ThemeColors)
  protected theme!: ThemeColors;

  protected timeline!: ComposeScreenTimeline;

  @resolved(Beatmap)
  protected beatmap!: Beatmap;

  compactTimeline = new BindableBoolean();

  @resolved(OsucadConfigManager)
  config!: OsucadConfigManager;

  @dependencyLoader()
  [Symbol('load')]() {
    this.config.bindWith(OsucadSettings.CompactTimeline, this.compactTimeline);

    this.add(this.body = new TimelineElement());

    this.body.body.alpha = 0.8;

    this.hitObject.changed.addListener(this.setup, this);
    this.hitObject.defaultsApplied.addListener(this.setup, this);

    this.selection.selectionChanged.addListener(([hitObject, selected]) => {
      if (hitObject !== this.hitObject)
        return;

      this.selectionChanged(selected);
    });

    this.compactTimeline.addOnChangeListener(e => this.moveToY(e.value ? -5 : 0, 200, EasingFunction.OutExpo));
    this.y = this.compactTimeline.value ? -5 : 0;
  }

  protected loadComplete() {
    super.loadComplete();

    this.timeline = this.findClosestParentOfType(ComposeScreenTimeline)!;
    if (!this.timeline) {
      throw new Error('RhythmTimelineObject must be a child of RhythmTimeline');
    }

    this.timeline.zoomBindable.valueChanged.addListener(this.invalidatePosition, this);
    this.timeline.drawSizeInvalidated.addListener(this.invalidatePosition, this);

    this.setup();

    this.selectionChanged(this.hitObject.isSelected);
  }

  setup() {
    this.body.bodyColor = this.hitObject.comboColor;
    this.updatePosition();
  }

  protected selectionChanged(selected: boolean) {
    this.body.selected = selected;
  }

  protected positionBacking = new Cached();

  update() {
    super.update();

    if (!this.positionBacking.isValid) {
      this.updatePosition();
      this.positionBacking.validate();
    }
  }

  invalidatePosition() {
    this.positionBacking.invalidate();
  }

  updatePosition() {
    const radius = this.drawHeight * 0.5;

    this.x = this.hitObject.startTime * this.timeline.pixelsPerMs - radius;
    this.width = this.timeline.durationToSize(this.hitObject.duration) + radius * 2;
  }

  override onInvalidate(invalidation: Invalidation, source: InvalidationSource): boolean {
    if (invalidation & Invalidation.DrawSize && source === InvalidationSource.Parent)
      this.updatePosition();

    return super.onInvalidate(invalidation, source);
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

    return false;
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

  dispose(isDisposing: boolean = true) {
    this.timeline.zoomBindable.valueChanged.removeListener(this.updatePosition);
    this.timeline.drawSizeInvalidated.removeListener(this.invalidatePosition, this);

    super.dispose(isDisposing);
  }
}
