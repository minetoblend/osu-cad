import type { ControlPointGroup, LifetimeEntry, OsuHitObject } from '@osucad/common';
import type { DragEvent, DragStartEvent, IKeyBindingHandler, InvalidationSource, KeyBindingPressEvent, MouseDownEvent } from 'osucad-framework';
import type { TimelineObject } from './TimelineObject';
import { HitCircle, HitObjectLifetimeEntry, LifetimeEntryManager, Slider, Spinner } from '@osucad/common';
import { Action, almostEquals, Anchor, Axes, Bindable, Box, clamp, Container, dependencyLoader, EasingFunction, Invalidation, MouseButton, resolved } from 'osucad-framework';
import { EditorAction } from '../EditorAction';
import { ControlPointPropertiesOverlay } from '../screens/compose/ControlPointPropertiesOverlay';
import { EditorSelection } from '../screens/compose/EditorSelection';
import { TimelineControlPointContainer } from '../screens/timing/TimelineControlPointContainer';
import { Timeline } from './Timeline';
import { TimelineHitCircle } from './TimelineHitCircle';
import { TimelineSlider } from './TimelineSlider';
import { TimelineSpinner } from './TimelineSpinner';

export class ComposeScreenTimeline extends Timeline implements IKeyBindingHandler<EditorAction> {
  @resolved(EditorSelection)
  selection!: EditorSelection;

  readonly activeControlPoint = new Bindable<ControlPointGroup | null>(null);

  @dependencyLoader()
  load() {
    this.addAllInternal(
      new TimelineControlPointContainer(),
      (this.#objectContainer = new Container({
        relativeSizeAxes: Axes.Both,
      })),
    );

    this.#objectContainer.drawNode.enableRenderGroup();

    this.addInternal(this.#dragBox);

    this.hitObjects.added.addListener(this.#onHitObjectAdded, this);
    this.hitObjects.removed.addListener(this.#onHitObjectRemoved, this);

    this.#entryManager.entryBecameAlive.addListener(this.#onEntryBecameAlive, this);
    this.#entryManager.entryBecameDead.addListener(this.#onEntryBecameDead, this);

    for (const hitObject of this.hitObjects)
      this.#onHitObjectAdded(hitObject);

    this.addInternal(this.#controlPointOverlay = new ControlPointPropertiesOverlay(this.activeControlPoint)
      .with({
        anchor: Anchor.BottomLeft,
        origin: Anchor.TopCenter,
        depth: -1,
        y: 4,
      }));

    this.activeControlPoint.addOnChangeListener((e) => {
      if (e.value && e.previousValue)
        this.#updateControlPointProperties(true);
      else
        this.#updateControlPointProperties(false, true);
    });

    this.controlPoints.groupRemoved.addListener((group) => {
      if (this.activeControlPoint.value === group)
        this.activeControlPoint.value = null;
    });
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
      // adding a tiny random value as a dirty hack to force pixi.js to use the same order as the actual child order
      this.#objectContainer.changeChildDepth(drawable, object.startTime + Math.random() * 0.01);
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

    this.#updateControlPointProperties();
  }

  updateAfterChildren() {
    super.updateAfterChildren();

    let lastPosition = -Number.MAX_VALUE;
    let stackHeight = 0;
    for (const child of this.#objectContainer.children) {
      if (almostEquals(child.x, lastPosition)) {
        child.y = -(++stackHeight) * 3;
      }
      else {
        stackHeight = 0;
        child.y = 0;
      }

      lastPosition = child.x;
    }
  }

  #updateControlPointProperties(animated = false, force = false) {
    if (!this.activeControlPoint.value)
      return;

    if (!animated && this.#controlPointOverlay.transforms.length > 0 && !force && !this.editorClock.isRunning)
      return;

    const time = this.activeControlPoint.value.time;

    let minX = 100;
    let maxX = this.childSize.x - 100;

    const drawWidth = this.#controlPointOverlay.drawWidth;

    minX += drawWidth * 0.5;
    maxX -= drawWidth * 0.5;

    const position = clamp(this.timeToPosition(time), minX, maxX);

    if (animated)
      this.#controlPointOverlay.moveToX(position, 300, EasingFunction.OutExpo);
    else
      this.#controlPointOverlay.x = position;
  }

  #controlPointOverlay!: ControlPointPropertiesOverlay;

  #dragStartTime = 0;
  #dragEndTime = 0;
  #dragBox = new Box({
    relativeSizeAxes: Axes.Y,
    alpha: 0,
  });

  readonly isKeyBindingHandler = true;

  override onInvalidate(invalidation: Invalidation, source: InvalidationSource): boolean {
    if (invalidation && Invalidation.DrawSize) {
      this.drawSizeInvalidated.emit();

      return super.onInvalidate(invalidation, source) || true;
    }

    return super.onInvalidate(invalidation, source);
  }

  drawSizeInvalidated = new Action();

  canHandleKeyBinding(action: EditorAction): boolean {
    return action instanceof EditorAction;
  }

  onKeyBindingPressed(e: KeyBindingPressEvent<EditorAction>): boolean {
    switch (e.pressed) {
      case EditorAction.CreateInheritedControlPoint:
        this.insertControlPoint(false);
        return true;
      case EditorAction.CreateUninheritedControlPoint:
        this.insertControlPoint(true);
        return true;
    }

    return false;
  }

  insertControlPoint(uninherited: boolean) {
    const time = Math.round(this.editorClock.targetTime);

    const group = this.controlPoints.controlPointGroupAtTime(time, true);

    if (uninherited && !group.timing) {
      const timingPoint = this.controlPoints.timingPointAt(time);

      group.add(timingPoint.deepClone());
    }

    this.controlPoints.add(group);

    this.activeControlPoint.value = group;
  }
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
