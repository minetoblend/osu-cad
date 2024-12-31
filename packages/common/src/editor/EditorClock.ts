import type { FrameTimeInfo, IAdjustableClock, IFrameBasedClock, Track } from 'osucad-framework';
import type { TimingPoint } from '../controlPoints/TimingPoint';
import { Action, almostEquals, AudioManager, Bindable, BindableBoolean, BindableNumber, clamp, Container, dependencyLoader, lerp, resolved } from 'osucad-framework';
import { IBeatmap } from '../beatmap/IBeatmap';
import { OsucadConfigManager } from '../config/OsucadConfigManager';
import { OsucadSettings } from '../config/OsucadSettings';
import { BindableBeatDivisor } from './BindableBeatDivisor';

export class EditorClock
  extends Container
  implements IFrameBasedClock, IAdjustableClock {
  constructor(readonly track: Track) {
    super();
  }

  animatedSeek = new BindableBoolean(true);

  started = new Action();

  stopped = new Action();

  @resolved(OsucadConfigManager)
  config!: OsucadConfigManager;

  @dependencyLoader()
  init() {
    this.config.bindWith(OsucadSettings.AnimatedSeek, this.animatedSeek);
    this.config.bindWith(OsucadSettings.AudioOffset, this.offsetBindable);
  }

  @resolved(AudioManager)
  audioManager!: AudioManager;

  offsetBindable = new BindableNumber(0);

  get offset() {
    return this.offsetBindable.value;
  }

  readonly isFrameBasedClock = true;

  override update(): void {
    super.update();

    this.processFrame();
    this.updateBeatProgress();
  }

  @resolved(IBeatmap)
  beatmap!: IBeatmap;

  get trackLength() {
    return this.track.length;
  }

  get controlPointInfo() {
    return this.beatmap.controlPoints;
  }

  beatSnapDivisor = new BindableBeatDivisor(4);

  seekSnapped(position: number) {
    const timingPoint = this.controlPointInfo.timingPointAt(position);

    position -= timingPoint.time;

    const beatSnapLength
      = timingPoint.beatLength / this.beatSnapDivisor.value;

    const closestBeat = Math.round(position / beatSnapLength);
    position = timingPoint.time + closestBeat * beatSnapLength;

    const nextTimingPoint = this.controlPointInfo.timingPoints.find(
      t => t.time > timingPoint.time,
    ) as TimingPoint | undefined;

    if (nextTimingPoint && position > nextTimingPoint?.time)
      position = nextTimingPoint.time;

    position = Math.floor(position);

    this.seek(position);
  }

  seekBackward(snapped = false, amount = 1) {
    this.seekBeats(-1, snapped, amount + (this.isRunning ? 1.5 : 0));
  }

  seekForward(snapped = false, amount = 1) {
    this.seekBeats(1, snapped, amount + (this.isRunning ? 1.5 : 0));
  }

  seekBeats(direction: number, snapped = false, amount = 1) {
    const timingPoint = this.controlPointInfo.timingPointAt(this.currentTimeAccurate);

    const beatSnapLength
      = timingPoint.beatLength / this.beatSnapDivisor.value;

    let newPosition = this.currentTimeAccurate + direction * amount * beatSnapLength;

    if (almostEquals(newPosition, timingPoint.time, 1)) {
      newPosition = timingPoint.time;
    }
    else if (newPosition < timingPoint.time) {
      const previousTimingPoint = this.controlPointInfo.timingPointAt(newPosition);

      newPosition = this.currentTime + direction * amount * (previousTimingPoint.beatLength / this.beatSnapDivisor.value);
    }

    if (snapped) {
      this.seekSnapped(newPosition);
    }
    else {
      this.seek(newPosition);
    }
  }

  #lastSeekWasAnimated = false;

  isSeeking = false;

  lastSeekTime = 0;

  get timeSinceLastSeek() {
    return super.clock!.currentTime - this.lastSeekTime;
  }

  seek(position: number, animated: boolean = true) {
    if (!this.animatedSeek.value)
      animated = false;

    position = clamp(position, 0, this.track.length);

    this.isSeeking = true;
    this.lastSeekTime = super.clock!.currentTime;

    this.#targetTime = position;
    this.#lastSeekWasAnimated = animated;

    if (this.isRunning) {
      this.#frameTimeInfo.current = position;
    }

    return this.track.seek(position - this.offset);
  }

  #previousOffset = 0;

  processFrame(): void {
    if (this.isRunning || !this.#lastSeekWasAnimated || this.#previousOffset !== this.offset) {
      this.#previousOffset = this.offset;

      const lastTime = this.currentTime;
      const currentTime = clamp(this.currentTimeAccurate, 0, this.track.length);
      this.#targetTime = currentTime;

      this.#frameTimeInfo = {
        current: currentTime,
        elapsed: currentTime - lastTime,
      };

      this.#lastSeekWasAnimated = false;
    }
    else {
      const lastTime = this.currentTime;
      let currentTime = lerp(
        this.#targetTime,
        lastTime,
        Math.exp(-this.parent!.clock!.elapsedFrameTime * 0.03),
      );

      if (almostEquals(currentTime, this.#targetTime, 3)) {
        currentTime = this.#targetTime;
        this.#lastSeekWasAnimated = false;
      }

      this.#frameTimeInfo = {
        current: currentTime,
        elapsed: currentTime - lastTime,
      };
    }

    this.currentTimeBindable.value = this.currentTime;

    if (this.currentTime >= this.track.length) {
      this.stop();
    }
  }

  get currentTime(): number {
    return this.#frameTimeInfo.current;
  }

  get currentTimeAccurate(): number {
    return this.track.currentTime + this.offset;
  }

  #targetTime = 0;

  get targetTime() {
    return this.#targetTime;
  }

  #frameTimeInfo: FrameTimeInfo = {
    current: 0,
    elapsed: 0,
  };

  currentTimeBindable = new Bindable(0);

  get elapsedFrameTime(): number {
    return this.#frameTimeInfo.elapsed;
  }

  #delayedStart = false;

  get isRunning(): boolean {
    return this.track.isRunning || this.#delayedStart;
  }

  start() {
    this.track.start();
    this.started.emit();
  }

  stop() {
    this.track.stop();
    this.#targetTime = this.currentTimeAccurate;
    this.stopped.emit();
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

  beatLength = 0;
  beatProgress = 0;
  beatIndex = 0;
  timingPointProgress = 0;

  updateBeatProgress() {
    const timingPoint = this.controlPointInfo.timingPointAt(this.currentTime);

    function mod(a: number, n: number) {
      return ((a % n) + n) % n;
    }

    this.beatLength = timingPoint.beatLength;
    let progress = (this.currentTime - timingPoint.time) / timingPoint.beatLength;

    this.timingPointProgress = progress;

    this.beatIndex = Math.floor(progress);

    progress = mod(mod(progress, 1) + 1, 1);

    this.beatProgress = progress;
  }

  override dispose(disposing: boolean = true) {
    this.track.dispose();

    super.dispose(disposing);
  }

  snap(time: number) {
    return this.beatmap.controlPoints.snap(time, this.beatSnapDivisor.value);
  }
}
