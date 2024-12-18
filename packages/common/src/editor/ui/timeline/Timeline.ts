import type { ScrollEvent, Vec2 } from 'osucad-framework';
import { BindableNumber, Container, EasingFunction, provide, resolved } from 'osucad-framework';
import { EditorClock } from '../../EditorClock';

@provide(Timeline)
export class Timeline extends Container {
  @resolved(EditorClock)
  editorClock!: EditorClock;

  #currentTime = new BindableNumber(0);

  syncWithEditorClock = true;

  get currentTime() {
    if (this.syncWithEditorClock)
      return this.editorClock.currentTime;

    return this.#currentTime.value;
  }

  set currentTime(time: number) {
    if (this.syncWithEditorClock)
      this.editorClock.seek(time, false);
    else
      this.#currentTime.value = time;
  }

  seek(time: number, animated = true) {
    if (this.syncWithEditorClock)
      this.editorClock.seek(time, animated);
    else
      this.transformTo('currentTime', time, 150, EasingFunction.OutCubic);
  }

  readonly zoomBindable = new BindableNumber(1);

  get zoom() {
    return this.zoomBindable.value;
  }

  set zoom(value: number) {
    this.zoomBindable.value = value;
  }

  get visibleDuration() {
    return this.zoom * 4000;
  }

  get startTime() {
    return this.currentTime - this.visibleDuration / 2;
  }

  get endTime() {
    return this.currentTime + this.visibleDuration / 2;
  }

  timeToPosition(time: number) {
    return (time - this.startTime) * this.pixelsPerMs;
  }

  durationToSize(duration: number) {
    return duration * this.pixelsPerMs;
  }

  sizeToDuration(size: number) {
    return size / this.pixelsPerMs;
  }

  positionToTime(time: number) {
    return time / this.pixelsPerMs + this.startTime;
  }

  screenSpacePositionToTime(position: Vec2) {
    return this.positionToTime(this.toLocalSpace(position).x);
  }

  get pixelsPerMs() {
    return this.drawSize.x / this.visibleDuration;
  }

  zoomSpeed = 0.3;

  override onScroll(e: ScrollEvent): boolean {
    if (e.altPressed) {
      if (e.scrollDelta.y > 0)
        this.zoomIn(1, this.positionToTime(e.mousePosition.x));
      else
        this.zoomOut(1, this.positionToTime(e.mousePosition.x));

      return true;
    }

    return false;
  }

  zoomOut(factor: number = 1, time: number = this.editorClock.currentTime) {
    const oldZoom = this.zoom;
    const newZoom = Math.min(this.zoom * (1 + this.zoomSpeed * factor), 8);

    const oldPosition = this.timeToPosition(time);
    this.zoom = newZoom;
    const newPosition = this.timeToPosition(time);
    const deltaTime = this.sizeToDuration(newPosition - oldPosition);
    this.zoom = oldZoom;

    this.zoomTo(newZoom, 0, EasingFunction.Default);

    if (!this.syncWithEditorClock)
      this.currentTime += deltaTime;
  }

  zoomIn(factor: number = 1, time: number = this.editorClock.currentTime) {
    const oldZoom = this.zoom;
    const zoom = Math.max(this.zoom / (1 + this.zoomSpeed * factor), 0.25);

    const oldPosition = this.timeToPosition(time);
    this.zoom = zoom;
    const newPosition = this.timeToPosition(time);
    const deltaTime = this.sizeToDuration(newPosition - oldPosition);
    this.zoom = oldZoom;

    this.zoomTo(zoom, 0, EasingFunction.Default);

    if (!this.syncWithEditorClock)
      this.currentTime += deltaTime;
  }

  zoomTo(zoom: number, duration: number, easing: EasingFunction) {
    return this.transformTo('zoom', zoom, duration, easing);
  }

  override update() {
    super.update();

    if (this.syncWithEditorClock) {
      this.#currentTime.value = this.editorClock.currentTime;
    }
    else if (this.editorClock.isRunning || this.editorClock.targetTime !== this.editorClock.currentTime) {
      if (this.editorClock.currentTimeAccurate > this.endTime)
        this.currentTime = this.editorClock.currentTimeAccurate + this.visibleDuration / 2.1;

      if (this.editorClock.currentTimeAccurate < this.startTime)
        this.currentTime = this.editorClock.currentTimeAccurate - this.visibleDuration / 2.1;
    }
  }
}
