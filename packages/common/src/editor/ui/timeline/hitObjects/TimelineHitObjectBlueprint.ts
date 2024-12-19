import type { DragEndEvent, DragEvent, DragStartEvent, MouseDownEvent } from 'osucad-framework';
import type { HitObjectLifetimeEntry } from '../../../../hitObjects/drawables/HitObjectLifetimeEntry';
import { hasComboInformation, HitObjectList, SliderRepeat } from '@osucad/common';
import { Anchor, Axes, Bindable, BindableNumber, Container, dependencyLoader, FillMode, MouseButton, provide, resolved } from 'osucad-framework';
import { Color } from 'pixi.js';
import { UpdateHandler } from '../../../../crdt/UpdateHandler';
import { hasDuration } from '../../../../hitObjects/IHasDuration';
import { hasSliderVelocity } from '../../../../hitObjects/IHasSliderVelocity';
import { PoolableDrawableWithLifetime } from '../../../../pooling/PoolableDrawableWithLifetime';
import { ISkinSource } from '../../../../skinning/ISkinSource';
import { EditorClock } from '../../../EditorClock';
import { Timeline } from '../Timeline';
import { DurationAdjustmentPiece } from './DurationAdjustmentPiece';
import { SliderVelocityAdjustmentPiece } from './SliderVelocityAdjustmentPiece';
import { TimelineHitObjectBody } from './TimelineHitObjectBody';
import { TimelineHitObjectHead } from './TimelineHitObjectHead';
import { TimelineRepeatPiece } from './TimelineRepeatPiece';

@provide()
export class TimelineHitObjectBlueprint extends PoolableDrawableWithLifetime<HitObjectLifetimeEntry> {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Y;
  }

  readonly accentColor = new Bindable(new Color(0xFFFFFF));

  readonly comboIndexBindable = new BindableNumber(0);

  @resolved(ISkinSource)
  protected currentSkin!: ISkinSource;

  protected body!: TimelineHitObjectBody;

  protected head!: TimelineHitObjectHead;

  #repeatContainer!: Container;

  #tailContainer!: Container;

  readonly startTimeBindable = new BindableNumber(0);

  readonly indexInComboBindable = new BindableNumber(0);

  @dependencyLoader()
  [Symbol('load')]() {
    this.addAllInternal(
      this.body = new TimelineHitObjectBody(this),
      this.#tailContainer = new Container({
        relativeSizeAxes: Axes.Both,
        fillMode: FillMode.Fit,
        anchor: Anchor.CenterRight,
        origin: Anchor.CenterRight,
      }),
      this.#repeatContainer = new Container({
        relativeSizeAxes: Axes.Both,
      }),
      this.head = new TimelineHitObjectHead(this),
    );

    this.comboIndexBindable.valueChanged.addListener(this.updateComboColor, this);
    this.currentSkin.sourceChanged.addListener(this.updateComboColor, this);
    this.updateComboColor();
  }

  protected override onApply(entry: HitObjectLifetimeEntry) {
    super.onApply(entry);

    this.startTimeBindable.bindTo(entry.hitObject.startTimeBindable);
    if (hasComboInformation(entry.hitObject)) {
      this.comboIndexBindable.bindTo(entry.hitObject.comboIndexBindable);
      this.indexInComboBindable.bindTo(entry.hitObject.indexInComboBindable);
    }

    if (hasDuration(entry.hitObject)) {
      this.#tailContainer.add(new DurationAdjustmentPiece(this, entry.hitObject));
    }
    else if (hasSliderVelocity(entry.hitObject)) {
      this.#tailContainer.add(new SliderVelocityAdjustmentPiece(this, entry.hitObject));
    }

    entry.hitObject.defaultsApplied.addListener(this.#updateRepeats, this);

    this.updateComboColor();
    this.#updateRepeats();
  }

  protected override onFree(entry: HitObjectLifetimeEntry) {
    super.onFree(entry);

    this.startTimeBindable.unbindFrom(entry.hitObject.startTimeBindable);
    if (hasComboInformation(entry.hitObject)) {
      this.comboIndexBindable.unbindFrom(entry.hitObject.comboIndexBindable);
      this.indexInComboBindable.unbindFrom(entry.hitObject.indexInComboBindable);
    }

    entry.hitObject.defaultsApplied.removeListener(this.#updateRepeats, this);

    this.#tailContainer.clear();
  }

  protected updateComboColor() {
    if (!this.hitObject || !(hasComboInformation(this.hitObject)))
      return;

    this.accentColor.value = this.hitObject.getComboColor(this.currentSkin);
  }

  override get shouldBeAlive(): boolean {
    return true;
  }

  get hitObject() {
    return this.entry?.hitObject ?? null;
  }

  @resolved(Timeline)
  timeline!: Timeline;

  override update() {
    super.update();

    this.x = this.timeline.timeToPosition(this.hitObject!.startTime) - this.drawHeight * 0.5;
    this.width = this.timeline.durationToSize(this.hitObject!.duration) + this.drawHeight;
  }

  @resolved(HitObjectList)
  hitObjects!: HitObjectList;

  @resolved(UpdateHandler)
  updateHandler!: UpdateHandler;

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Right) {
      this.hitObjects.remove(this.hitObject!);
      this.updateHandler.commit();
      return true;
    }

    return false;
  }

  @resolved(EditorClock)
  editorClock!: EditorClock;

  #dragOffset = 0;

  override onDragStart(e: DragStartEvent): boolean {
    this.#dragOffset = this.timeline.screenSpacePositionToTime(e.screenSpaceMousePosition) - this.hitObject!.startTime;
    return true;
  }

  override onDrag(e: DragEvent): boolean {
    let time = this.timeline.screenSpacePositionToTime(e.screenSpaceMousePosition) - this.#dragOffset;

    if (!e.shiftPressed)
      time = this.editorClock.snap(time);

    this.hitObject!.startTime = time;

    return true;
  }

  override onDragEnd(e: DragEndEvent) {
    this.updateHandler.commit();
  }

  #updateRepeats() {
    this.#repeatContainer.clear();

    for (const hitObject of this.hitObject!.nestedHitObjects) {
      if (hitObject instanceof SliderRepeat)
        this.#repeatContainer.add(new TimelineRepeatPiece(this, hitObject));
    }
  }
}
