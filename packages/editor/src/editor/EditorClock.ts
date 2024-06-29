import { Beatmap, TimingPoint } from '@osucad/common';
import {
  Bindable,
  Container,
  FrameTimeInfo,
  IAdjustableClock,
  IFrameBasedClock,
  Track,
  resolved,
} from 'osucad-framework';

export class EditorClock
  extends Container
  implements IFrameBasedClock, IAdjustableClock
{
  constructor(readonly track: Track) {
    super();
  }

  readonly isFrameBasedClock = true;

  update(): void {
    super.update();

    this.processFrame();
  }

  @resolved(Beatmap)
  beatmap!: Beatmap;

  get trackLength() {
    return this.track.length;
  }

  get controlPointInfo() {
    return this.beatmap.controlPoints;
  }

  beatSnapDivisor = new Bindable(4);

  seekSnapped(position: number) {
    const timingPoint = this.controlPointInfo.timingPointAt(position);

    const beatSnapLength =
      timingPoint.timing.beatLength / this.beatSnapDivisor.value;

    const closestBeat = Math.round(position / beatSnapLength);
    position = timingPoint.time + closestBeat * beatSnapLength;

    const nextTimingPoint = this.controlPointInfo.controlPoints.find(
      (t) => t.timing && t.time > timingPoint.time,
    ) as TimingPoint | undefined;

    if (nextTimingPoint && position > nextTimingPoint?.time)
      position = nextTimingPoint.time;

    this.seek(position);
  }

  seekBackward(snapped = false, amount = 1) {
    this.seekBeats(-1, snapped, amount + (this.isRunning ? 1.5 : 0));
  }

  seekForward(snapped = false, amount = 1) {
    this.seekBeats(1, snapped, amount + (this.isRunning ? 1.5 : 0));
  }

  seekBeats(direction: number, snapped = false, amount = 1) {
    const timingPoint = this.controlPointInfo.timingPointAt(this.currentTime);

    const beatSnapLength =
      timingPoint.timing.beatLength / this.beatSnapDivisor.value;

    const newPosition = this.currentTime + direction * amount * beatSnapLength;

    if (snapped) {
      this.seekSnapped(newPosition);
    } else {
      this.seek(newPosition);
    }
  }

  seek(position: number) {
    return this.track.seek(position);
  }

  processFrame(): void {
    const lastTime = this.currentTime;
    const currentTime = this.currentTimeAccurate;

    this.#frameTimeInfo = {
      current: currentTime,
      elapsed: currentTime - lastTime,
    };

    if (currentTime >= this.track.length) {
      this.stop();
    }
  }

  get currentTime(): number {
    return this.#frameTimeInfo.current;
    // return this.track.currentTime;
  }

  get currentTimeAccurate(): number {
    return this.track.currentTime;
  }

  #frameTimeInfo: FrameTimeInfo = {
    current: 0,
    elapsed: 0,
  };

  get elapsedFrameTime(): number {
    return this.#frameTimeInfo.elapsed;
  }

  get isRunning(): boolean {
    return this.track.isRunning;
  }

  start() {
    this.track.start();
  }

  stop() {
    this.track.stop();
  }

  get framesPerSecond(): number {
    throw new Error('Not applicable for EditorClock');
  }
  get timeInfo(): FrameTimeInfo {
    return this.#frameTimeInfo;
  }

  reset(): void {
    this.track.reset();
  }

  get rate(): number {
    return this.track.rate;
  }

  set rate(value: number) {
    this.track.rate = value;
  }

  resetSpeedAdjustments(): void {
    this.track.resetSpeedAdjustments();
  }
}
