import {Ticker} from "pixi.js";
import {Drawable} from "./drawables/Drawable.ts";
import {AudioManager} from "./audio/AudioManager.ts";

export class EditorClock extends Drawable {

  constructor(private readonly audioManager: AudioManager) {
    super();
  }

  private _currentTime = 0;

  private _currentTimeAnimated = 0;
  private _isPlaying = { value: false };
  private _deltaTime = 0;


  get currentTime() {
    return this._currentTime;
  }

  get currentTimeAnimated() {
    return this._currentTimeAnimated;
  }

  get isPlaying() {
    return this.audioManager.isPlaying;
  }

  get songDuration() {
    return this.audioManager.songDuration * 1000;
  }

  get deltaTime() {
    return this._deltaTime;
  }

  get playbackRate() {
    return this.audioManager.playbackRate;
  }

  set playbackRate(value: number) {
    this.audioManager.playbackRate = value;
  }

  async play() {
    await this.audioManager.play(this.currentTime / 1000);
    this._isPlaying.value = true;
  }

  pause() {
    const time = this.audioManager.pause();
    if (time !== undefined) {
      this._currentTime = time * 1000;
      this._currentTimeAnimated = time * 1000;
    }
    this._isPlaying.value = false;
  }

  async seek(time: number, animated: boolean = true) {
    if (time < 0) time = 0;
    if (time > this.songDuration) time = this.songDuration;

    if (this.isPlaying) {
      await this.audioManager.play(time / 1000);
    }

    this._currentTime = time;
    if (!animated)
      this._currentTimeAnimated = time;
  }


  onTick() {
    const time = this._currentTime;
    if (this.isPlaying) {
      this._currentTime = this.audioManager.currentTime * 1000;
      this._currentTimeAnimated = this._currentTime;
    } else {
      const t = Math.min(Ticker.shared.deltaTime * 0.5, 1);
      this._currentTimeAnimated = this._currentTimeAnimated + (this._currentTime - this._currentTimeAnimated) * t;
    }
    if (Math.abs(this._currentTime - this._currentTimeAnimated) < 1)
      this._currentTimeAnimated = this._currentTime;

    this._deltaTime = this._currentTime - time;

  }

}
