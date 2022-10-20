import {Container, Sprite, Texture} from "pixi.js";
import hitcircle from '@/assets/skin/hitcircle.png'
import hitcircleOverlay from '@/assets/skin/hitcircleoverlay.png'
import approachCircle from '@/assets/skin/approachcircle.png'
import {clamp, Color} from "@/util/math";
import {animate} from "@/util/animation";
import {ref} from "vue";
import {ComboNumberDrawable} from "@/editor/viewport/drawable/comboNumber.drawable";
import {EditorContext} from "@/editor";

export class DrawableCirclePiece extends Container {


    constructor(readonly ctx: EditorContext, hasApproachCircle: boolean = true) {
        super()

        this.#hitcircleContainer = new Container()
        this.#hitcircle = new Sprite(Texture.from(hitcircle))
        this.#hitcircleOverlay = new Sprite(Texture.from(hitcircleOverlay))

        this.#hitcircle.anchor.set(0.5, 0.5)
        this.#hitcircleOverlay.anchor.set(0.5, 0.5)

        this.#hitcircleContainer.addChild(this.#hitcircle, this.#hitcircleOverlay)
        this.addChild(this.#hitcircleContainer)

        if (hasApproachCircle) {
            this.#approachCircle = new Sprite(Texture.from(approachCircle))
            this.#approachCircle.anchor.set(0.5, 0.5)
            this.addChild(this.#approachCircle)
        } else {
            this.#approachCircle = null
        }

        this.#combo = new ComboNumberDrawable()
        this.addChild(this.#combo)
    }

    set comboNumber(value: number) {
        this.#combo.comboNumber.value = value
    }

    #hitcircleContainer

    #hitcircle: Sprite;
    #combo: ComboNumberDrawable;
    #hitcircleOverlay: Sprite;
    #approachCircle: Sprite | null;

    #ticks: number[] = [0]

    lastTime = NaN

    update(t: number) {
        const approachCircle = this.#approachCircle

        this.scale.set(0.55)

        const fadeinTime = 500
        const preemptTime = 500

        if (approachCircle) {
            approachCircle.tint = this.tint.hex;

            if (t < 0) {
                const a = Math.min(fadeinTime * 2, preemptTime)
                approachCircle.alpha = clamp((t + a) / a, 0, 1)
                approachCircle.scale.set(clamp(4 - ((t + preemptTime)) / preemptTime * 3, 1, 4))
            } else {
                approachCircle.alpha = animate(t, 0, 800, 1, 0)
                approachCircle.scale.set(animate(t, 0, 100, 1, 1.05, x => 1 - (1 - x) * (1 - x)))
            }
        }

        if (t < 0) {
            const a = Math.min(fadeinTime * 2, preemptTime)
            this.#combo.alpha = clamp((t + a) / a, 0, 1)
        } else {
            this.#combo.alpha = animate(t, 0, 800, 1, 0)
        }

        this.#hitcircle.tint = this.tint.hex;
        this.#hitcircleOverlay.tint = this.overlayTint.hex

        const firstTick = this.#ticks[0]
        const lastTick = this.#ticks[this.#ticks.length - 1]


        if (t < 0) {
            this.#hitcircleContainer.alpha = animate(t, -fadeinTime, -200, 0, 1)

        } else if (t < lastTick) {
            this.#hitcircleContainer.alpha = 1

        } else {
            const timeSinceLastTick = t - lastTick

            this.#hitcircleContainer.alpha = animate(timeSinceLastTick, 0, 1000, 1, 0)
            //     this.alpha = animate(t, 0, 700, 1, 0)
            this.#hitcircle.tint = 0xffffff
        }

        this.#ticks.forEach(tick => {
            if (this.ctx.clock.isPlaying && !isNaN(this.lastTime) && t >= tick && this.lastTime < tick) {
                this.ctx.hsSample?.play()
            }
        })

        this.lastTime = t
    }

    set circleVisible(value: boolean) {
        this.#hitcircleContainer.visible = value
    }

    setTicks(ticks: number[]) {
        this.#ticks = ticks
    }

    dispose() {
        this.destroy({children: true, texture: true})
    }

    #tint = ref(Color.white)

    get tint() {
        return this.#tint.value
    }

    set tint(value) {
        this.#tint.value = value
    }

    #overlayTint = ref(Color.white)

    get overlayTint() {
        return this.#overlayTint.value
    }

    set overlayTint(value) {
        this.#overlayTint.value = value
    }
}