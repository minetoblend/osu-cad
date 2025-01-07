import type { ContainerOptions, MouseDownEvent, MouseUpEvent, ReadonlyDependencyContainer, ScrollEvent, Vec2 } from 'osucad-framework';
import { Axes, clamp, EasingFunction, MouseButton, provide, resolved } from 'osucad-framework';
import { EditorClock } from '../../EditorClock';
import { ZoomableScrollContainer } from './ZoomableScrollContainer';

@provide(Timeline)
export class Timeline extends ZoomableScrollContainer {
  @resolved(EditorClock)
  protected editorClock!: EditorClock;

  override onScroll(e: ScrollEvent): boolean {
    if (!e.altPressed && !e.isPrecise)
      return false;

    return super.onScroll(e);
  }

  #lastScrollPosition = 0;

  #lastTrackTime = 0;

  #handlingDragInput = false;

  #trackWasPlaying = false;

  #defaultTimelineZoom = 1;

  #trackLengthForZoom = 0;

  constructor(options: ContainerOptions = {}) {
    super();

    this.with(options);

    this.relativeSizeAxes = Axes.Both;
    this.zoomDuration = 200;
    this.zoomEasing = EasingFunction.OutExpo;
    this.scrollbarVisible = false;
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);
  }

  override adjustZoomRelatively(change: number, focusPoint?: number) {
    super.adjustZoomRelatively(change);
  }

  override update() {
    super.update();

    this.content.margin = { horizontal: this.drawWidth / 2 };

    if (this.editorClock.isRunning)
      this.#scrollToTrackTime();

    if (this.editorClock.trackLength !== this.#trackLengthForZoom) {
      const getZoomLevelForVisibleMilliseconds = (milliseconds: number) => Math.max(1, (this.editorClock.trackLength / milliseconds));

      this.#defaultTimelineZoom = getZoomLevelForVisibleMilliseconds(6000);

      const minimumZoom = getZoomLevelForVisibleMilliseconds(10000);
      const maximumZoom = getZoomLevelForVisibleMilliseconds(500);

      const initialZoom = clamp(this.#defaultTimelineZoom, minimumZoom, maximumZoom);

      this.setupZoom(initialZoom, minimumZoom, maximumZoom);

      this.#trackLengthForZoom = this.editorClock.trackLength;
    }
  }

  override updateAfterChildren() {
    super.updateAfterChildren();

    if (this.isDragging) {
      this.#seekTrackToCurrent();
    }
    else if (!this.editorClock.isRunning) {
      if (this.current !== this.#lastScrollPosition && this.editorClock.currentTime === this.#lastTrackTime && !this.editorClock.isSeeking) {
        this.#seekTrackToCurrent();
      }
      else if (!this.transforms.some(it => it.targetMember === 'currentZoom')) {
        this.#scrollToTrackTime();
      }
    }

    this.#lastScrollPosition = this.current;
    this.#lastTrackTime = this.editorClock.currentTime;
  }

  #seekTrackToCurrent() {
    const target = this.timeAtPosition(this.current);
    this.editorClock.seek(Math.min(this.editorClock.trackLength, target), false);
  }

  #scrollToTrackTime() {
    if (this.editorClock.trackLength === 0)
      return;

    if (this.#handlingDragInput)
      this.editorClock.stop();

    const position = this.positionAtTime(this.editorClock.currentTime);
    this.scrollTo(position, false);
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    if (super.onMouseDown(e))
      this.#beginUserDrag();

    return e.button === MouseButton.Left;
  }

  override onMouseUp(e: MouseUpEvent) {
    this.#endUserDrag();
  }

  #beginUserDrag() {
    this.#handlingDragInput = true;
    this.#trackWasPlaying = this.editorClock.isRunning;
    this.editorClock.stop();
  }

  #endUserDrag() {
    this.#handlingDragInput = false;

    if (this.#trackWasPlaying)
      this.editorClock.start();
  }

  get visibleRange(): number {
    return this.editorClock.trackLength / this.zoom;
  }

  timeAtPosition(x: number): number {
    return x / this.content.drawWidth * this.editorClock.trackLength;
  }

  get startTime() {
    return this.timeAtPosition(this.current);
  }

  get endTime() {
    return this.timeAtPosition(this.current + this.drawWidth);
  }

  positionAtTime(time: number): number {
    return time / this.editorClock.trackLength * this.content.drawWidth;
  }

  screenSpacePositionToTime(screenSpacePosition: Vec2): number {
    return this.timeAtPosition(this.content.toLocalSpace(screenSpacePosition).x);
  }
}
