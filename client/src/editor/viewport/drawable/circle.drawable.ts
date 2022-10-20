import {DrawableHitObject} from "@/editor/viewport/drawable/hitobject";
import {Renderer, Sprite, Texture} from "pixi.js";
import {EditorContext} from "@/editor";
import {Vec2} from "@/util/math";
import {WatchPool} from "@/util/watch";
import {shallowRef, watchEffect} from "vue";
import {Lifetime} from "@/util/disposable";
import {PlayfieldDrawable} from "@/editor/viewport/playfield";
import {DrawableCirclePiece} from "@/editor/viewport/drawable/circlePiece.drawable";
import {HitCircle} from "@/editor/hitobject/circle";

import selectionOverlay from '@/assets/skin/hitcircleoverlay.png'

export class DrawableHitCircle extends DrawableHitObject {

    readonly lifetime = new Lifetime()

    constructor(ctx: EditorContext, renderer: Renderer, playfield: PlayfieldDrawable) {
        super(ctx, renderer, playfield);
        this.#circlePiece = new DrawableCirclePiece(this.ctx)
        this.addChild(this.#circlePiece)
        this.lifetime.add(watchEffect(() => this.init(), {flush: "pre"}))

        this.selectionOverlay.anchor.set(0.5)
        this.addChild(this.selectionOverlay)

    }

    #circlePiece
    #hitobject = shallowRef<HitCircle>()

    #watchPool = new WatchPool()

    private selectionOverlay = new Sprite(Texture.from(selectionOverlay))

    private radius = 0

    bindTo(t: HitCircle) {
        this.#hitobject.value = t
        this.init()
    }

    get hitObject() {
        return this.#hitobject.value ?? null
    }

    init() {
        const circle = this.#hitobject.value;
        if (!circle)
            return;

        this.position.copyFrom(circle.overriddenPosition)

        this.#circlePiece.tint = this.ctx.state.beatmap.metadata.getComboColor(circle.comboIndex.value)

        this.#circlePiece.comboNumber = circle.comboNumber.value
    }

    lastTime = NaN

    update(time: number) {
        const circle = this.#hitobject.value!

        this.zIndex = -Math.floor(circle.time)
        const t = time - circle.time
        this.radius = this.ctx.state.beatmap.difficulty.circleRadius

        this.#circlePiece.update(t)

        if (circle.selectedBy.value) {
            this.selectionOverlay.scale.set(
                this.ctx.state.beatmap.difficulty.circleRadius / 64 * 1.1
            )
            if (circle.selectedBy.value === this.ctx.state.user.sessionId) {
                this.selectionOverlay.alpha = 1
            } else {
                this.selectionOverlay.alpha = this.#circlePiece.alpha
            }

            const user = this.ctx.state.user.findById(circle.selectedBy.value)
            if (user) {
                this.selectionOverlay.tint = user.color.hex
                this.selectionOverlay.visible = true
            }
        } else {
            this.selectionOverlay.visible = false
        }

        this.lastTime = time
    }

    dispose() {
        this.destroy({children: true, texture: false})
        this.lifetime.dispose()
    }

    isMouseInside(mousepos: Vec2): boolean {
        const pos = this.#hitobject.value?.position
        if (!pos)
            return false;

        return pos.sub(mousepos).lengthSquared < (this.radius * this.radius);
    }

    isVisibleAt(time: number): boolean {
        const hitobject = this.#hitobject.value
        if (!hitobject) return false

        return time >= hitobject.overriddenTime - 650 && time < hitobject.overriddenEndTime + 1000
    }
}