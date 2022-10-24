import {DrawableHitObject} from "@/editor/viewport/drawable/hitobject";
import {Slider} from "@/editor/hitobject/slider";
import {DrawableSliderBody} from "@/editor/viewport/drawable/sliderBody.drawable";
import {EditorContext} from "@/editor";
import {Lifetime} from "@/util/disposable";
import {AnimatedSprite, Container, Renderer, Sprite, Texture} from "pixi.js";
import {clamp, Color, Vec2} from "@/util/math";
import {animate} from "@/util/animation";
import {PlayfieldDrawable} from "@/editor/viewport/playfield";
import {DrawableCirclePiece} from "@/editor/viewport/drawable/circlePiece.drawable";
import sliderFollowCircle from '@/assets/skin/sliderfollowcircle.png'

import sliderb0 from '@/assets/skin/sliderb0.png'
import sliderb1 from '@/assets/skin/sliderb1.png'
import sliderb2 from '@/assets/skin/sliderb2.png'
import sliderb3 from '@/assets/skin/sliderb3.png'
import sliderb4 from '@/assets/skin/sliderb4.png'
import sliderb5 from '@/assets/skin/sliderb5.png'
import sliderb6 from '@/assets/skin/sliderb6.png'
import sliderb7 from '@/assets/skin/sliderb7.png'
import sliderb8 from '@/assets/skin/sliderb8.png'
import sliderb9 from '@/assets/skin/sliderb9.png'
import {ref, shallowRef, watchEffect} from "vue";

export class DrawableSlider extends DrawableHitObject {

    readonly lifetime = new Lifetime()
    #sliderBody;
    // #circlePiece;
    #slider = shallowRef<Slider>()
    #sliderBall
    #sliderFollowCircle

    #sliderContainer = new Container()

    #sliderStart: DrawableCirclePiece
    #sliderEnd: DrawableCirclePiece

    get slider() {
        return this.#slider.value
    }

    set slider(value) {
        this.#slider.value = value
    }

    constructor(ctx: EditorContext, renderer: Renderer, playfield: PlayfieldDrawable) {
        super(ctx, renderer, playfield);

        this.#sliderBody = new DrawableSliderBody(ctx, renderer, playfield)

        this.#sliderStart = new DrawableCirclePiece(ctx)
        this.#sliderEnd = new DrawableCirclePiece(ctx, false)

        const textures: string[] = [
            sliderb0,
            sliderb1,
            sliderb2,
            sliderb3,
            sliderb4,
            sliderb5,
            sliderb6,
            sliderb7,
            sliderb8,
            sliderb9
        ]

        this.#sliderBall = new AnimatedSprite(textures.map(it => Texture.from(it)), false)
        this.#sliderBall.anchor.set(0.5)

        this.#sliderFollowCircle = new Sprite(Texture.from(sliderFollowCircle))
        this.#sliderFollowCircle.anchor.set(0.5)

        this.#sliderContainer.addChild(
            this.#sliderBody,
            this.#sliderStart,
            this.#sliderEnd,
            this.#sliderBall,
            this.#sliderFollowCircle
        )

        this.addChild(this.#sliderContainer)


        this.lifetime.add(watchEffect(() => this.init(), {flush: "pre"}))
    }

    #selectionOverlay: DrawableSliderBody | null = null

    bindTo(hitobject: Slider | undefined): void {
        this.slider = hitobject
        this.#sliderBody.bind(hitobject)
        this.init()
    }

    #tint = ref(0xffffff)

    init() {
        const slider = this.slider
        if (!slider) return;

        const tint = this.ctx.beatmap.metadata.getComboColor(slider.comboIndex.value)
        this.#sliderStart.comboNumber = slider.comboNumber.value

        this.#tint.value
        this.#sliderStart.tint = tint
        this.#sliderEnd.tint = tint
        this.#sliderBody.tint = tint

        const pointy = this.ctx.beatmapId === '1602707_3273002'

        if (pointy) {
            // this.#sliderStart.circleVisible = false
            this.#sliderEnd.circleVisible = false
        }
    }

    get hitObject() {
        return this.slider ?? null
    }

    update(time: number): void {
        const slider = this.slider
        if (!slider)
            return;

        slider.updateProgress(time)

        let t = time - slider.time

        const fadeinTime = 650
        const preemptTime = 400

        this.position.copyFrom(slider.overriddenPosition)

        this.#sliderStart.position.set(0)

        this.#sliderEnd.position.copyFrom(
            slider.overriddenPath.endPosition.sub(slider.overriddenPosition)
        )

        this.#sliderBall.scale.set(0.55);
        this.#sliderStart.scale.set(0.55);
        this.#sliderEnd.scale.set(0.55);

        if (slider.selectedBy.value) {
            const color = this.ctx.users.getColor(slider.selectedBy.value)!
            this.#sliderBody.outlineColor = color
            this.#sliderStart.overlayTint = color
            this.#sliderEnd.overlayTint = color

        } else {
            const white = Color.white
            this.#sliderBody.outlineColor = white
            this.#sliderStart.overlayTint = white
            this.#sliderEnd.overlayTint = white
        }

        const sliderBallPos = slider.overriddenPath.getProgress(slider.sliderBallProgress)

        if (slider.sliderBallProgress < 1) {
            const nextPos = slider.overriddenPath.getProgress(
                Math.min(slider.sliderBallProgress + 0.01, 1)
            )
            this.#sliderBall.rotation = nextPos.sub(sliderBallPos).angle
        }

        this.#sliderBall.position.set(
            sliderBallPos.x - slider.overriddenPosition.x,
            sliderBallPos.y - slider.overriddenPosition.y
        )

        const velocity = slider.velocity

        this.#sliderBall.gotoAndStop((Math.floor(time * 0.2 / velocity)) % 10)

        this.#sliderFollowCircle.position.set(
            sliderBallPos.x - slider.overriddenPosition.x,
            sliderBallPos.y - slider.overriddenPosition.y
        )

        if (t < 0) {
            const a = Math.min(fadeinTime * 2, preemptTime)
            const fadeInProgress = clamp((t + a) / a * 1.5, 0, 1)
            this.#sliderBall.alpha = 0
            this.#sliderFollowCircle.alpha = 0
            if (this.#selectionOverlay) {
                this.#selectionOverlay.alpha = slider.selectedBy.value === this.ctx.users.sessionId ? 1 : fadeInProgress
            }
            this.#sliderBody.alpha = animate(t, -fadeinTime, -preemptTime, 0, 1)

        } else if (t < slider.overriddenDuration) {
            const followCircleFadeTime = Math.min(150, slider.overriddenDuration)
            this.#sliderFollowCircle.scale.set(animate(t, 0, followCircleFadeTime, 0.25, 0.55))
            this.#sliderFollowCircle.alpha = animate(t, 0, followCircleFadeTime, 0, 1)
            this.#sliderBall.alpha = 1
        } else {
            const timeSinceEnd = t - slider.overriddenDuration

            this.#sliderFollowCircle.scale.set(animate(timeSinceEnd, 0, 150, 0.55, 0.25))
            this.#sliderFollowCircle.alpha = animate(timeSinceEnd, 0, 150, 1, 0)


            const alpha = animate(timeSinceEnd, 0, 400, 1, 0)
            this.#sliderBody.alpha = alpha

            if (this.#selectionOverlay) {
                this.#selectionOverlay.alpha = slider.selectedBy.value === this.ctx.users.sessionId ? 1 : alpha
            }

            this.#sliderBall.alpha = 0
        }

        const startTicks: number[] = []
        const endTicks: number [] = []
        for (let i = 0; i <= slider.repeatCount; i++) {
            if (i % 2 === 0) {
                startTicks.push(i * slider.overriddenSpanDuration)
            } else {
                endTicks.push(i * slider.overriddenSpanDuration)
            }
        }

        this.#sliderStart.setTicks(startTicks)
        this.#sliderEnd.setTicks(endTicks)

        this.#sliderStart.update(t)
        this.#sliderEnd.update(t)
    }

    dispose(): void {
        this.lifetime.dispose()
    }

    isMouseInside(mousepos: Vec2): boolean {
        const slider = this.slider
        if (!slider)
            return false

        const radius = this.ctx.beatmap.difficulty.circleRadius


        if (mousepos.sub(slider.overriddenPosition).lengthSquared < radius * radius)
            return true


        for (let d = 0; d < slider!.overriddenPath.expectedDistance; d += 20) {
            if (slider!.overriddenPath.getProgress(d / slider.overriddenPath.expectedDistance).sub(mousepos).lengthSquared < (radius * radius))
                return true
        }

        return false
    }

    isVisibleAt(time: number): boolean {
        const slider = this.#slider.value
        if (!slider) return false

        return time >= slider.overriddenTime - 650 && time < slider.overriddenEndTime + 1000
    }

}