import type { TimingPoint } from '@osucad/common';
import { Beatmap } from '@osucad/common';
import type {
  FrameTimeInfo,
  IAdjustableClock,
  IFrameBasedClock,
  Track,
} from 'osucad-framework';
import {
  AudioManager,
  Bindable,
  Container,
  almostEquals,
  clamp,
  dependencyLoader,
  lerp,
  resolved,
} from 'osucad-framework';
import { PreferencesStore } from '../preferences/PreferencesStore';

export class EditorClock
  extends Container
  implements IFrameBasedClock, IAdjustableClock {
  constructor(readonly track: Track) {
    super();
  }

  @dependencyLoader()
  init() {
    this.scheduler.addDelayed(() => {
      if (this.preferences.audio.automaticOffset) {
        const offset = -this.audioManager.context.outputLatency * 1000;

        if (!almostEquals(offset, this.preferences.audio.audioOffset, 1)) {
          this.preferences.audio.audioOffset = offset;
        }
      }
    }, 1000, true);

    this.preferences.audio.automaticOffsetBindable.addOnChangeListener((enabled) => {
      if (enabled) {
        this.preferences.audio.audioOffset = -this.audioManager.context.outputLatency * 1000;
      }
    });
  }

  @resolved(PreferencesStore)
  preferences!: PreferencesStore;

  @resolved(AudioManager)
  audioManager!: AudioManager;

  get offset() {
    return this.preferences.audio.audioOffset;
  }

  readonly isFrameBasedClock = true;

  update(): void {
    super.update();

    this.processFrame();
    this.updateBeatProgress();
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

    position -= timingPoint.time;

    const beatSnapLength
      = timingPoint.timing.beatLength / this.beatSnapDivisor.value;

    const closestBeat = Math.round(position / beatSnapLength);
    position = timingPoint.time + closestBeat * beatSnapLength;

    const nextTimingPoint = this.controlPointInfo.controlPoints.find(
      t => t.timing && t.time > timingPoint.time,
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
    const timingPoint = this.controlPointInfo.timingPointAt(this.currentTime);

    const beatSnapLength
      = timingPoint.timing.beatLength / this.beatSnapDivisor.value;

    const newPosition = this.currentTime + direction * amount * beatSnapLength;

    if (snapped) {
      this.seekSnapped(newPosition);
    }
    else {
      this.seek(newPosition);
    }
  }

  #lastSeekWasAnimated = false;

  seek(position: number, animated: boolean = true) {
    position = clamp(position, 0, this.track.length);

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

      this.currentTimeBindable.value = currentTime;

      this.#lastSeekWasAnimated = false;
    }
    else {
      const lastTime = this.currentTime;
      let currentTime = lerp(
        lastTime,
        this.#targetTime,
        clamp(this.parent!.clock.elapsedFrameTime * 0.015),
      );

      if (almostEquals(currentTime, this.#targetTime, 3)) {
        currentTime = this.#targetTime;
      }

      this.#frameTimeInfo = {
        current: currentTime,
        elapsed: currentTime - lastTime,
      };

      this.currentTimeBindable.value = currentTime;
    }

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
  }

  stop() {
    this.track.stop();
    this.#targetTime = this.currentTimeAccurate;
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

  updateBeatProgress() {
    const timingPoint = this.controlPointInfo.timingPointAt(this.currentTime);

    function mod(a: number, n: number) {
      return ((a % n) + n) % n;
    }

    this.beatLength = timingPoint.timing.beatLength;
    let progress
      = (this.currentTime - timingPoint.time) / timingPoint.timing.beatLength;
    progress = mod(mod(progress, 1) + 1, 1);
    this.beatProgress = progress;
  }

  dispose(): boolean {
    this.track.dispose();

    return super.dispose();
  }
}
