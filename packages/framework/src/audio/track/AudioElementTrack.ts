import type { AudioChannel } from '../AudioChannel';
import { Track } from './Track';

export class AudioElementTrack extends Track {
  constructor(
    readonly context: AudioContext,
    readonly channel: AudioChannel,
    readonly el: HTMLAudioElement,
  ) {
    super();

    this.#source = this.context.createMediaElementSource(el);
    this.#source.connect(channel.input);
  }

  get length() {
    return this.el.duration * 1000;
  }

  readonly #source: MediaElementAudioSourceNode;

  override get currentTime(): number {
    return this.el.currentTime * 1000;
  }

  override seek(position: number): boolean {
    if (position > this.length)
      return false;

    this.el.currentTime = position / 1000;

    return true;
  }

  #offset = 0;
  #timeAtStart = 0;
  #contextTimeAtStart = 0;

  protected get contextTimeMillis() {
    return performance.now();
  }

  override start(): void {
    if (this.isRunning)
      return;

    this.el.play();

    this.#contextTimeAtStart = this.contextTimeMillis;
    this.#timeAtStart = this.#offset;

    this.el.play().then(() => {
      this.#contextTimeAtStart = this.contextTimeMillis;
    });

    this.el.onended = (ev) => {
      if (this.contextTimeMillis - this.#offset < this.length - 10)
        return;
      this.#offset += (this.contextTimeMillis - this.#contextTimeAtStart) * this.rate;
      this.raiseCompleted();
    };
  }

  override stop(): void {
    if (!this.#source)
      return;

    this.el.pause();

    this.#offset = this.el.currentTime;
  }

  override get isRunning(): boolean {
    return !this.el.paused;
  }

  #rate = 1;

  override get rate(): number {
    return this.#rate;
  }

  override set rate(value: number) {
    if (!this.isRunning) {
      this.#rate = value;
      return;
    }

    this.stop();
    this.#rate = value;
    if (this.#source) {
      this.el.playbackRate = value;
    }
    this.start();
  }

  override dispose(): void {
    this.stop();
  }
}
