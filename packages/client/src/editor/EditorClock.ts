import { Ticker } from 'pixi.js';
import { Component } from '../framework/drawable/Component';
import { lerp } from '../framework/math/lerp';
import { resolved } from '@/framework/di/DependencyLoader.ts';
import { Beatmap } from '@osucad/common';

export class EditorClock extends Component {
  constructor() {
    super();
    addEventListener('keydown', (e) => {
      if (e.key === ' ') {
        this.#isPlaying = !this.#isPlaying;
      }
    });
  }

  beatSnapDivisor = 4;

  #currentTime: number = 0;

  #currentTimeAnimated: number = 0;

  #isPlaying: boolean = false;

  playbackSpeed = 1;

  @resolved(Beatmap)
  beatmap!: Beatmap;

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

  get progressAnimated(): number {
    return this.currentTimeAnimated / this.songDuration;
  }

  get isPlaying(): boolean {
    return this.#isPlaying;
  }

  snap(time: number) {
    return this.beatmap.controlPoints.snap(time, this.beatSnapDivisor);
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
      this.#currentTime += Ticker.shared.deltaMS * this.playbackSpeed;
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

  play() {
    this.#isPlaying = true;
  }

  pause() {
    this.#isPlaying = false;
  }
}
