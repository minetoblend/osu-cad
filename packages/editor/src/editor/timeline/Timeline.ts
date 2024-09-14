import { BindableNumber, KeyDownEvent, MouseDownEvent, PIXIContainer, ScrollEvent } from 'osucad-framework';
import {
  Anchor,
  Axes,
  Box,
  Container,
  dependencyLoader,
  EasingFunction,
  MouseButton,
  resolved,
} from 'osucad-framework';
import { EditorClock } from '../EditorClock';
import { ThemeColors } from '../ThemeColors';
import { EditorSelection } from '../screens/compose/EditorSelection';
import { Beatmap } from '../../beatmap/Beatmap';
import { HitObjectList } from '../../beatmap/hitObjects/HitObjectList';
import { TimelineTick } from './TimelineTick';

export class Timeline extends Container {
  constructor() {
    super({
      relativeSizeAxes: Axes.Both,
    });

    this.childrenWillGoOutOfBounds = false;
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
      new Box({
        width: 2,
        relativeSizeAxes: Axes.Y,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        color: this.theme.primary,
      }),
    );

  }


  update() {
    super.update();

    this.#updateTicks();
  }

  #tickContainer!: PIXIContainer<TimelineTick>;

  @resolved(Beatmap)
  beatmap!: Beatmap;

  protected get controlPoints() {
    return this.beatmap.controlPoints;
  }

  zoomBindable = new BindableNumber(1);

  get zoom() {
    return this.zoomBindable.value;
  }

  set zoom(value) {
    this.zoomBindable.value = value;
  }

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
    performance.mark('Timeline#updateTicks');
    this.#tickContainer.y = this.drawSize.y;
    this.#tickContainer.scale.set(1, 15);
    this.#tickContainer.pivot.y = 1;

    const ticks = [
      ...this.controlPoints.tickGenerator.generateTicks(
        this.startTime,
        this.endTime,
        this.editorClock.beatSnapDivisor.value,
      ),
    ];

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

    performance.measure('Timeline#updateTicks', 'Timeline#updateTicks');
  }

  zoomSpeed = 0.3;

  zoomOut(factor: number = 1) {
    const zoom = Math.min(this.zoom * (1 + this.zoomSpeed * factor), 8);
    this.zoomTo(zoom, 150, EasingFunction.OutQuad);
  }

  zoomIn(factor: number = 1) {
    const zoom = Math.max(this.zoom / (1 + this.zoomSpeed * factor), 0.25);
    this.zoomTo(zoom, 150, EasingFunction.OutQuad);
  }

  zoomTo(zoom: number, duration: number, easing: EasingFunction) {
    return this.transformTo('zoom', zoom, duration, easing);
  }

  @resolved(EditorSelection)
  selection!: EditorSelection;

  @resolved(HitObjectList)
  hitObjects!: HitObjectList;

  onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left && !e.controlPressed) {
      this.selection.clear();
    }

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

