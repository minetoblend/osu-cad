import type { OsuHitObject } from '../../beatmap/hitObjects/OsuHitObject.ts';
import type { LifetimeEntry } from '../../pooling/LifetimeEntry.ts';
import type { TimelineObject } from './TimelineObject.ts';
import {
  Axes,
  type Bindable,
  Box,
  Container,
  dependencyLoader,
  type DragEvent,
  type DragStartEvent,
  MouseButton,
  type MouseDownEvent,
  resolved,
} from '../../../../framework/src';
import { HitCircle } from '../../beatmap/hitObjects/HitCircle.ts';
import { Slider } from '../../beatmap/hitObjects/Slider.ts';
import { Spinner } from '../../beatmap/hitObjects/Spinner.ts';
import { LifetimeEntryManager } from '../../pooling/LifetimeEntryManager.ts';
import { HitObjectLifetimeEntry } from '../hitobjects/HitObjectLifetimeEntry.ts';
import { EditorSelection } from '../screens/compose/EditorSelection.ts';
import { Timeline } from './Timeline.ts';
import { TimelineHitCircle } from './TimelineHitCircle.ts';
import { TimelineSlider } from './TimelineSlider.ts';
import { TimelineSpinner } from './TimelineSpinner.ts';

export class ComposeScreenTimeline extends Timeline {
  @resolved(EditorSelection)
  selection!: EditorSelection;

  @dependencyLoader()
  load() {
    this.addInternal(
      (this.#objectContainer = new Container({
        relativeSizeAxes: Axes.Both,
      })),
    );

    this.addInternal(this.#dragBox);

    this.hitObjects.added.addListener(this.#onHitObjectAdded, this);
    this.hitObjects.removed.addListener(this.#onHitObjectRemoved, this);

    this.#entryManager.entryBecameAlive.addListener(this.#onEntryBecameAlive, this);
    this.#entryManager.entryBecameDead.addListener(this.#onEntryBecameDead, this);

    for (const hitObject of this.hitObjects) {
      this.#onHitObjectAdded(hitObject);
    }
  }

  #entries = new Map<OsuHitObject, TimelineLifefetimeEntry>();

  #onHitObjectAdded(hitObject: OsuHitObject) {
    if (hitObject.synthetic)
      return;

    const entry = new TimelineLifefetimeEntry(hitObject);

    this.#entryManager.addEntry(entry);

    this.#entries.set(hitObject, entry);
  }

  #onHitObjectRemoved(hitObject: OsuHitObject) {
    const entry = this.#entries.get(hitObject);
    if (!entry)
      return;

    this.#entryManager.removeEntry(entry);
  }

  onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left && !e.controlPressed) {
      this.selection.clear();
    }

    return true;
  }

  #entryManager = new LifetimeEntryManager();

  #onEntryBecameAlive(entry: LifetimeEntry) {
    const hitObject = (entry as TimelineLifefetimeEntry).hitObject as OsuHitObject;

    const newDrawable = this.createDrawable(hitObject);
    if (!newDrawable)
      return;

    this.#addObject(newDrawable, hitObject);
  }

  #onEntryBecameDead(entry: LifetimeEntry) {
    const hitObject = (entry as TimelineLifefetimeEntry).hitObject as OsuHitObject;
    this.#removeObject(hitObject);
  }

  #objectContainer!: Container;

  #startTimeMap = new Map<OsuHitObject, Bindable<number>>();

  #addObject(drawable: TimelineObject, object: OsuHitObject) {
    this.#hitObjectMap.set(object, drawable);

    drawable.depth = object.startTime;

    const startTime = object.startTimeBindable.getBoundCopy();

    this.#startTimeMap.set(object, startTime);

    startTime.valueChanged.addListener(() => {
      this.#objectContainer.changeChildDepth(drawable, object.startTime);
    });

    this.#objectContainer.add(drawable);
  }

  #removeObject(object: OsuHitObject) {
    const drawable = this.#hitObjectMap.get(object);
    if (!drawable)
      return;

    this.#objectContainer.remove(drawable);

    this.#hitObjectMap.delete(object);

    const startTime = this.#startTimeMap.get(object);
    if (startTime) {
      startTime.unbindAll();
      this.#startTimeMap.delete(object);
    }
  }

  #hitObjectMap = new Map<OsuHitObject, TimelineObject>();

  protected createDrawable(object: OsuHitObject): TimelineObject | null {
    if (object instanceof HitCircle)
      return new TimelineHitCircle(object);
    if (object instanceof Slider)
      return new TimelineSlider(object);
    if (object instanceof Spinner)
      return new TimelineSpinner(object);

    return null;
  }

  onDragStart(e: DragStartEvent): boolean {
    this.#dragStartTime = this.positionToTime(e.mousePosition.x);
    this.#dragEndTime = this.#dragStartTime;
    this.#dragBox.alpha = 0.2;

    this.#startSelection = this.selection.selectedObjects;

    return true;
  }

  onDrag(e: DragEvent): boolean {
    this.#dragEndTime = this.positionToTime(e.mousePosition.x);

    const selectedObjects = this.hitObjects.filter((it) => {
      return (
        it.startTime <= Math.max(this.#dragStartTime, this.#dragEndTime)
        && it.endTime >= Math.min(this.#dragStartTime, this.#dragEndTime)
      );
    });

    if (e.controlPressed) {
      this.selection.select([...this.#startSelection, ...selectedObjects]);
    }
    else {
      this.selection.select(selectedObjects);
    }

    return true;
  }

  #startSelection: OsuHitObject[] = [];

  onDragEnd(): boolean {
    this.#dragBox.alpha = 0;

    return true;
  }

  update() {
    super.update();

    this.#objectContainer.x = -this.startTime * this.pixelsPerMs;

    this.#entryManager.update(this.startTime, this.endTime);

    if (this.isDragged) {
      const startTime = Math.min(this.#dragStartTime, this.#dragEndTime);
      const endTime = Math.max(this.#dragStartTime, this.#dragEndTime);

      this.#dragBox.x = this.timeToPosition(startTime);
      this.#dragBox.width = this.timeToPosition(endTime) - this.#dragBox.x;
    }
  }

  #dragStartTime = 0;
  #dragEndTime = 0;
  #dragBox = new Box({
    relativeSizeAxes: Axes.Y,
    alpha: 0,
  });
}

class TimelineLifefetimeEntry extends HitObjectLifetimeEntry {
  constructor(hitObject: OsuHitObject) {
    super(hitObject);
  }

  override get initialLifetimeOffset() {
    return 500;
  }

  protected override setInitialLifetime() {
    super.setInitialLifetime();

    this.lifetimeEnd = this.hitObject.endTime + 500;
  }
}