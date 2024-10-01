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

    console.log('seeking', position, this.el.seekable.end(0));

    this.el.currentTime = position / 1000;

    return true;
  }

  protected get contextTimeMillis() {
    return performance.now();
  }

  override start(): void {
    if (this.isRunning)
      return;

    this.el.play();

    this.el.onended = () => {
      this.raiseCompleted();
    };
  }

  override stop(): void {
    if (!this.#source)
      return;

    this.el.pause();
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
    this.el.playbackRate = value;
    this.start();
  }

  override dispose(): void {
    this.stop();
  }
}
