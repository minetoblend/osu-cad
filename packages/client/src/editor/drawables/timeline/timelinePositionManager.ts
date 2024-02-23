import {TimelineZoom} from "@/editor/TimelineZoom.ts";
import {Drawable} from "@/editor/drawables/Drawable.ts";
import {Inject} from "@/editor/drawables/di";
import {EditorClock} from "@/editor/clock.ts";

export class TimelinePositionManager extends Drawable {
  constructor(
    readonly zoom: TimelineZoom = new TimelineZoom()
  ) {
    super();
  }

  @Inject(EditorClock)
  clock!: EditorClock

  availableWidth: number = 100

  centerFactor = 0.4

  get startTime() {
    return this.clock.currentTimeAnimated - this.visibleDuration * this.centerFactor
  }

  get endTime() {
    return this.clock.currentTimeAnimated + this.visibleDuration * (1 - this.centerFactor)
  }

  get visibleDuration() {
    return this.zoom.visibleDuration
  }

  getPositionForTime(time: number) {
    return (time - this.startTime) / this.visibleDuration * this.availableWidth;
  }

  getTimeAtPosition(position: number) {
    return this.startTime + position / this.availableWidth * this.visibleDuration;
  }

  get pixelsPerMillisecond() {
    return this.availableWidth / this.visibleDuration;
  }

  get millisecondsPerPixel() {
    return this.visibleDuration / this.availableWidth;
  }
}