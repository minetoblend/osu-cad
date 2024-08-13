import type { HitObject } from '@osucad/common';
import { Beatmap, HitCircle, HitObjectManager, Slider } from '@osucad/common';
import type {
  DragEvent,
  DragStartEvent,
  KeyDownEvent,
  MouseDownEvent,
  PIXIContainer,
  ScrollEvent,
} from 'osucad-framework';
import {
  Anchor,

  Axes,
  Box,
  Container,
  MouseButton,
  almostEquals,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import gsap from 'gsap';
import { EditorClock } from '../EditorClock';
import { ThemeColors } from '../ThemeColors';
import { EditorSelection } from '../screens/compose/EditorSelection';
import { TimelineTick } from './TimelineTick';
import type { TimelineObject } from './TimelineObject';
import { TimelineHitCircle } from './TimelineHitCircle';
import { TimelineSlider } from './TimelineSlider';

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

    const container = new Container();

    this.addInternal(container);

    this.#tickContainer = container.drawNode as PIXIContainer<TimelineTick>;

    this.#tickContainer.enableRenderGroup();

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

    this.hitObjects.onUpdated.addListener(([hitObject, type]) => {
      if (type === 'startTime') {
        const drawable = this.#hitObjectMap.get(hitObject);
        if (drawable) {
          this.#objectContainer.changeChildDepth(drawable, hitObject.startTime);
        }
      }
    });
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
      it => it.endTime >= startTime && it.startTime <= endTime && !it.isGhost,
    );

    const shouldRemove = new Set(this.#hitObjectMap.keys());
    let previousStartTime = -Infinity;
    let stackHeight = 0;

    for (let i = objects.length; i >= 0; i--) {
      const object = objects[i];
      let drawable = this.#hitObjectMap.get(object);
      if (!drawable) {
        const newDrawable = this.createDrawable(object);
        if (!newDrawable)
          continue;

        this.#hitObjectMap.set(object, newDrawable);

        newDrawable.depth = object.startTime;

        this.#objectContainer.add(newDrawable);

        drawable = newDrawable;
      }

      shouldRemove.delete(object);
    }

    for (let i = 0; i < objects.length; i++) {
      const object = objects[i];
      const drawable = this.#hitObjectMap.get(object);

      if (!drawable)
        continue;

      if (almostEquals(object.startTime, previousStartTime)) {
        stackHeight++;

        drawable.y = -stackHeight * 5;
      }
      else {
        stackHeight = 0;

        drawable.y = 0;
      }

      previousStartTime = object.startTime;
    }

    for (const object of shouldRemove) {
      const drawable = this.#hitObjectMap.get(object);
      if (drawable) {
        this.#objectContainer.remove(drawable);
        this.#hitObjectMap.delete(object);
      }
    }
  }

  protected createDrawable(object: HitObject): TimelineObject | null {
    if (object instanceof HitCircle)
      return new TimelineHitCircle(object);

    if (object instanceof Slider)
      return new TimelineSlider(object);

    return null;
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

  @resolved(EditorSelection)
  selection!: EditorSelection;

  @resolved(HitObjectManager)
  hitObjects!: HitObjectManager;

  #startSelection: HitObject[] = [];

  onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left && !e.controlPressed) {
      this.selection.clear();
    }

    return true;
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

    const selectedObjects = this.hitObjects.hitObjects.filter((it) => {
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

  onDragEnd(): boolean {
    this.#dragBox.alpha = 0;

    return true;
  }

  onKeyDown(e: KeyDownEvent): boolean {
    if (!e.controlPressed && e.shiftPressed && e.key.startsWith('Digit')) {
      const digit = Number.parseInt(e.key[5]);
      if (digit !== 0) {
        this.editorClock.beatSnapDivisor.value = digit;
        return true;
      }
    }

    return false;
  }

  onScroll(e: ScrollEvent): boolean {
    if (e.altPressed) {
      if (e.scrollDelta.y > 0)
        this.zoomIn();
      else
        this.zoomOut();

      return true;
    }

    return false;
  }
}
