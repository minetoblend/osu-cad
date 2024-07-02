import { Beatmap, HitObject } from '@osucad/common';
import {
  Anchor,
  Axes,
  Box,
  Container,
  DragEndEvent,
  DragEvent,
  DragStartEvent,
  PIXIContainer,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import { EditorClock } from '../EditorClock';
import { ThemeColors } from '../ThemeColors';
import { TimelineTick } from './TimelineTick';
import gsap from 'gsap';
import { TimelineObject } from './TimelineObject';

export class Timeline extends Container {
  constructor() {
    super({
      relativeSizeAxes: Axes.Both,
    });
  }

  @resolved(ThemeColors)
  theme!: ThemeColors;

  @dependencyLoader()
  init() {
    this.addInternal(
      new Box({
        relativeSizeAxes: Axes.Both,
        color: this.theme.translucent,
        alpha: 0.5,
      }),
    );

    this.drawNode.addChild((this.#tickContainer = new PIXIContainer()));

    this.addInternal(
      (this.#objectContainer = new Container({
        relativeSizeAxes: Axes.Both,
      })),
    );

    this.addInternal(this.#dragBox);

    this.addInternal(
      new Box({
        width: 2,
        relativeSizeAxes: Axes.Y,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        color: this.theme.primary,
      }),
    );
  }

  #objectContainer!: Container;

  update() {
    super.update();

    this.#updateTicks();
    this.#updateObjects();

    if (this.isDragged) {
      const startTime = Math.min(this.#dragStartTime, this.#dragEndTime);
      const endTime = Math.max(this.#dragStartTime, this.#dragEndTime);

      this.#dragBox.x = this.timeToPosition(startTime);
      this.#dragBox.width = this.timeToPosition(endTime) - this.#dragBox.x;
    }
  }

  #tickContainer!: PIXIContainer<TimelineTick>;

  @resolved(Beatmap)
  beatmap!: Beatmap;

  protected get controlPoints() {
    return this.beatmap.controlPoints;
  }

  zoom = 1;

  get visibleDuration() {
    return this.zoom * 2000;
  }

  @resolved(EditorClock)
  editorClock!: EditorClock;

  get startTime() {
    return this.editorClock.currentTime - this.visibleDuration / 2;
  }

  get endTime() {
    return this.editorClock.currentTime + this.visibleDuration / 2;
  }

  timeToPosition(time: number) {
    return (time - this.startTime) * this.pixelsPerMs;
  }

  positionToTime(time: number) {
    return time / this.pixelsPerMs + this.startTime;
  }

  durationToSize(duration: number) {
    return duration * this.pixelsPerMs;
  }

  get pixelsPerMs() {
    return this.drawSize.x / this.visibleDuration;
  }

  #updateTicks() {
    this.#tickContainer.y = this.drawSize.y * 0.5;
    this.#tickContainer.scale.set(1, this.drawSize.y);

    const ticks = this.controlPoints.getTicks(
      this.startTime,
      this.endTime,
      this.editorClock.beatSnapDivisor.value,
    );

    for (let i = this.#tickContainer.children.length; i < ticks.length; i++) {
      this.#tickContainer.addChild(new TimelineTick());
    }
    if (ticks.length < this.#tickContainer.children.length) {
      this.#tickContainer.removeChildren(
        ticks.length,
        this.#tickContainer.children.length,
      );
    }

    for (let i = 0; i < ticks.length; i++) {
      const tick = this.#tickContainer.children[i];
      const tickInfo = ticks[i];
      tick.x = this.timeToPosition(tickInfo.time);
      tick.type = tickInfo.type;
    }
  }

  #hitObjectMap = new Map<HitObject, TimelineObject>();

  #updateObjects() {
    const startTime = this.startTime - 1000;
    const endTime = this.endTime + 1000;
    const objects = this.beatmap.hitObjects.hitObjects.filter(
      (it) => it.endTime >= startTime && it.startTime <= endTime,
    );

    const shouldRemove = new Set(this.#hitObjectMap.keys());
    for (let i = 0; i < objects.length; i++) {
      const object = objects[i];
      let drawable = this.#hitObjectMap.get(object);
      if (!drawable) {
        drawable = new TimelineObject(object);
        this.#hitObjectMap.set(object, drawable);
        this.#objectContainer.add(drawable);
      }
      drawable.drawNode.zIndex = objects.length - i;
      shouldRemove.delete(object);
    }

    for (const object of shouldRemove) {
      const drawable = this.#hitObjectMap.get(object);
      if (drawable) {
        this.#objectContainer.remove(drawable);
        this.#hitObjectMap.delete(object);
      }
    }
  }

  zoomSpeed = 0.3;

  zoomOut(factor: number = 1) {
    gsap.to(this, {
      zoom: Math.min(this.zoom * (1 + this.zoomSpeed * factor), 8),
      duration: 0.15,
      ease: 'power2.out',
    });
  }

  zoomIn(factor: number = 1) {
    gsap.to(this, {
      zoom: Math.max(this.zoom / (1 + this.zoomSpeed * factor), 0.25),
      duration: 0.15,
      ease: 'power2.out',
    });
  }

  #dragStartTime = 0;
  #dragEndTime = 0;
  #dragBox = new Box({
    relativeSizeAxes: Axes.Y,
    alpha: 0,
  });

  onDragStart(e: DragStartEvent): boolean {
    this.#dragStartTime = this.positionToTime(e.mousePosition.x);
    this.#dragEndTime = this.#dragStartTime;
    this.#dragBox.alpha = 0.2;

    return true;
  }

  onDrag(e: DragEvent): boolean {
    this.#dragEndTime = this.positionToTime(e.mousePosition.x);

    return true;
  }

  onDragEnd(e: DragEndEvent): boolean {
    this.#dragBox.alpha = 0;

    return true;
  }
}
