import {useRafFn, watchThrottled,} from "@vueuse/core";
import {ref, shallowRef} from "vue";
import {IUnisonContainer} from "@osucad/unison-client";
import {IMediaInstance, Sound} from "@pixi/sound";
import {useEditor} from "./createEditor";
import {RouteLocationNormalized} from "vue-router";

export class EditorClock {
  constructor(
    private readonly container: IUnisonContainer,
    private readonly songAudio: Sound,
    route: RouteLocationNormalized
  ) {
    if ("t" in route.query) {
      const time = parseInt(route.query.t as string);
      if (!isNaN(time)) this.seek(time, false);
    }

    useRafFn(() => {
      if (this.isPlaying) {
        this.#currentTime.value =
          this.#soundInstance.value!.progress * this.songAudio.duration;
        this.#currentTimeAnimated.value = this.#currentTime.value;
      } else if (
        Math.abs(this.#currentTime.value - this.#currentTimeAnimated.value) >
        0.001
      ) {
        this.#currentTimeAnimated.value =
          this.#currentTimeAnimated.value +
          (this.#currentTime.value - this.#currentTimeAnimated.value) * 0.3;
      } else if (
        this.#currentTime.value !== this.#currentTimeAnimated.value &&
        Math.abs(this.#currentTime.value - this.#currentTimeAnimated.value) <=
          0.001
      ) {
        this.#currentTimeAnimated.value = this.#currentTime.value;
      }
    });

    watchThrottled(
      () => [this.currentTime, this.playbackSpeed, this.isPlaying],
      ([currentTime, playbackSpeed, isPlaying]) => {
        this.container.users.setClientState("currentTime", {
          time: currentTime,
          isPlaying,
          playbackSpeed,
        });
      },
      { throttle: 100, immediate: true }
    );
  }

  #currentTime = ref(0);

  #currentTimeAnimated = ref(0);

  #playbackSpeed = ref(1);

  get currentTime() {
    return this.#currentTime.value * 1000;
  }

  get duration() {
    if (!this.songAudio.isLoaded) return 1;
    return this.songAudio.duration * 1000;
  }

  get currentTimeAnimated() {
    return this.#currentTimeAnimated.value * 1000;
  }

  get progress() {
    if (!this.songAudio.isLoaded) return 0;
    return this.currentTime / this.duration;
  }

  get progressAnimated() {
    if (!this.songAudio.isLoaded) return 0;
    return this.currentTimeAnimated / this.songAudio.duration;
  }

  #soundInstance = shallowRef<IMediaInstance>();

  get isPlaying() {
    return this.#soundInstance.value !== undefined;
  }

  async play() {
    const instance = await this.songAudio.play({
      start: this.#currentTime.value,
      speed: this.#playbackSpeed.value,
    });
    this.#soundInstance.value = instance;
    instance.once("end", () => (this.#soundInstance.value = undefined));
    instance.once("stop", () => (this.#soundInstance.value = undefined));

    return instance;
  }

  get playbackSpeed() {
    return this.#playbackSpeed.value;
  }

  set playbackSpeed(speed: number) {
    if (speed === this.#playbackSpeed.value) return;
    this.#playbackSpeed.value = speed;

    this.pause();
    this.play();
  }

  pause() {
    this.#soundInstance.value?.stop();
    this.#soundInstance.value?.destroy();
  }

  seek(time: number, animated = true) {
    if (time < 0) time = 0;
    if (time > this.duration) time = this.duration;

    this.#currentTime.value = time / 1000;
    if (!animated) this.#currentTimeAnimated.value = this.#currentTime.value;

    if (this.isPlaying) {
      this.pause();
      this.play();
    }
  }
}

export function useClock() {
  return useEditor()!.clock;
}
