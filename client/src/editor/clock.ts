import {ref, shallowRef} from "vue";
import gsap from "gsap";
import {Sound} from "@/audio/sound";
import {Ticker} from "pixi.js";

export class EditorClock {

    #time = ref(1500)
    #animatedTime = ref(1500)
    #duration = 180_000
    #tween: gsap.core.Tween | null = null
    #sound = shallowRef<Sound>();

    constructor() {
        Ticker.shared.add(() => this.update())
    }

    get time() {
        return Math.floor(this.#time.value)
    }

    get animatedTime() {
        return this.#animatedTime.value
    }

    get duration(): number {
        return Math.floor(this.#duration)
    }

    set sound(value) {
        this.#sound.value = value
        this.#duration = (value?.duration ?? 1) * 1000
        this.seek(this.time)
    }

    get sound() {
        return this.#sound.value
    }

    private set time(value: number) {
        if (value < 0)
            value = 0

        if (value > this.#duration)
            value = this.#duration

        if (this.sound)
            this.sound.currentTime = value / 1000

        this.#time.value = value
    }

    seek(time: number, animated = false) {
        if (this.#tween) {
            this.#tween.kill()
            this.#tween = null
        }

        this.time = time

        if (animated) {

            const difference = this.animatedTime - this.time// clamp(this.animatedTime - this.time, -200, 200)
            //this.#animatedTime.value = this.time + difference

            this.#tween = gsap.to(this.#animatedTime, {
                value: this.time,
                duration: 0.2 + Math.abs(difference) * 0.00001
            })
        } else {
            this.#animatedTime.value = this.time
        }
    }

    get isPlaying() {
        return this.sound?.isPlaying.value
    }

    play() {
        this.sound?.play()
    }

    pause() {
        this.sound?.pause()
    }

    togglePlaying() {
        if (this.isPlaying)
            this.pause()
        else
            this.play()
    }

    update() {
        if (this.isPlaying) {
            if (this.#tween) {
                this.#tween.kill()
                this.#tween = null
            }

            this.#time.value = this.sound!.currentTime * 1000
            this.#animatedTime.value = this.#time.value
        }
    }

    get playbackRate() {
        return this.sound?.playbackRate.value ?? 1
    }

    set playbackRate(value) {
        if (this.sound)
            this.sound.playbackRate.value = value
    }
}