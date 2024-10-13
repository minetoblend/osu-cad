import type { FrameTimeInfo, IAdjustableClock, IFrameBasedClock, Track } from 'osucad-framework';
import { AudioManager, BindableNumber, clamp, Component, dependencyLoader, resolved } from 'osucad-framework';
import { OsucadConfigManager } from '../config/OsucadConfigManager';
import { OsucadSettings } from '../config/OsucadSettings';

export class GameplayClock extends Component implements IFrameBasedClock, IAdjustableClock {
  constructor(readonly track: Track) {
    super();
  }

  @resolved(AudioManager)
  audioManager!: AudioManager;

  @resolved(OsucadConfigManager)
  config!: OsucadConfigManager;

  @dependencyLoader()
  load() {
    this.config.bindWith(OsucadSettings.AudioOffset, this.offsetBindable);

    this.seek(0);
  }

  #frameTimeInfo: FrameTimeInfo = {
    current: 0,
    elapsed: 0,
  };

  offsetBindable = new BindableNumber(0);

  get offset() {
    return this.offsetBindable.value;
  }

  update() {
    super.update();
    this.processFrame();
  }

  get elapsedFrameTime(): number {
    return this.#frameTimeInfo.elapsed;
  }

  get framesPerSecond(): number {
    throw new Error('Method applicable for GameplayClock.');
  }

  get timeInfo(): FrameTimeInfo {
    return this.#frameTimeInfo;
  }

  processFrame(): void {
    const lastTime = this.currentTime;
    const currentTime = clamp(this.track.currentTime + this.offset, 0, this.track.length);

    this.#frameTimeInfo = {
      current: currentTime,
      elapsed: currentTime - lastTime,
    };
  }

  readonly isFrameBasedClock = true;

  get currentTime(): number {
    return this.#frameTimeInfo.current;
  }

  get rate(): number {
    return this.track.rate;
  }

  set rate(value: number) {
    this.track.rate = value;
  }

  get isRunning(): boolean {
    return this.track.isRunning;
  }

  reset() {
    this.track.reset();
  }

  start() {
    this.track.start();
  }

  stop() {
    this.track.stop();
  }

  seek(position: number) {
    return this.track.seek(position);
  }

  resetSpeedAdjustments() {
    this.track.resetSpeedAdjustments();
  }

  override dispose(isDisposing: boolean = true) {
    this.stop();

    this.track.dispose();

    super.dispose(isDisposing);
  }
}
