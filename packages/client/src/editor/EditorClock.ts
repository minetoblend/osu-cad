import { Ticker } from 'pixi.js';
import { Component } from '../framework/drawable/Component';
import { lerp } from '../framework/math/lerp';

export class EditorClock extends Component {
  constructor() {
    super();
    addEventListener('wheel', (e) => {
      this.seek(this.currentTime + Math.sign(e.deltaY) * 100);
    });
    addEventListener('keydown', (e) => {
      if (e.key === ' ') {
        this.#isPlaying = !this.#isPlaying;
      }
    });
  }

  #currentTime: number = 0;

  #currentTimeAnimated: number = 0;

  #isPlaying: boolean = false;

  get currentTime(): number {
    return this.#currentTime;
  }

  get currentTimeAnimated(): number {
    return this.#currentTimeAnimated;
  }

  get songDuration() {
    return 90 * 1000;
  }

  get progress(): number {
    return this.currentTime / this.songDuration;
  }

  get isPlaying(): boolean {
    return this.#isPlaying;
  }

  seek(time: number, animated = true): void {
    if (time < 0) time = 0;
    if (time > this.songDuration) time = this.songDuration;

    this.#currentTime = time;
    if (!this.isAnimated || !animated) {
      this.#currentTimeAnimated = time;
    }
  }

  isAnimated = true;

  override onTick() {
    if (this.isPlaying) {
      this.#currentTime += Ticker.shared.deltaMS;
      this.#currentTimeAnimated = this.#currentTime;
    } else if (this.isAnimated) {
      this.#currentTimeAnimated = lerp(
        this.#currentTimeAnimated,
        this.#currentTime,
        Math.min(Ticker.shared.deltaTime * 0.5, 1),
      );
    } else {
      this.#currentTimeAnimated = this.#currentTime;
    }
  }
}
