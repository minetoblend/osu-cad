import {Container, Sprite, Texture} from "pixi.js";
import {shallowRef, watchEffect} from "vue";
import {HitObject} from "@/editor/hitobject";
import followPoint from '@/assets/skin/followpoint.png'
import {animate} from "@/util/animation";
import {Lifetime} from "@/util/disposable";

export class DrawableFollowPoint extends Container {

    static texture = Texture.from(followPoint)
    #lifetime = new Lifetime()

    constructor() {
        super();

        this.#lifetime.add(watchEffect(() => this.init()))
    }

    private start = shallowRef<HitObject>()
    private end = shallowRef<HitObject>()

    bind(start: HitObject, end: HitObject) {
        this.start.value = start
        this.end.value = end
    }

    init() {
        const start = this.start.value
        const end = this.end.value
        if (!start || !end)
            return;

        const startPos = start.overriddenEndPosition
        const endPos = end.overriddenPosition

        const delta = endPos.sub(startPos)

        const padding = 32
        const gap = 32
        const angle = delta.angle

        this.removeChildren()
        const amount = Math.round((delta.length - padding * 2) / gap)
        for (let i = 0; i < amount; i++) {
            const sprite = new Sprite(DrawableFollowPoint.texture)
            sprite.scale.set(0.75)
            sprite.anchor.set(0.5)
            sprite.rotation = angle
            this.addChild(sprite)
        }
    }

    update(time: number) {
        const start = this.start.value
        const end = this.end.value
        if (!start || !end)
            return;

        const startPos = start.overriddenEndPosition
        const endPos = end.overriddenPosition
        const startTime = start.overriddenEndTime
        const endTime = end.overriddenTime

        const delta = endPos.sub(startPos)

        let fadeInStartTime = startTime - 600
        let fadeInEndTime = startTime - 400

        let fadeOutStartTime = startTime
        let fadeOutEndTime = startTime + 400


        const step = (endTime - startTime) / this.children.length
        const direction = delta.normalized

        const gap = 32
        const padding = (delta.length - ((this.children.length - 1) * gap)) / 2

        for (let i = 0; i < this.children.length; i++) {
            const f = i / ((this.children.length - 1) || 0)
            let distance = padding + i * gap

            const sprite = this.children[i] as Sprite

            if (time < fadeInEndTime) {
                sprite.alpha = animate(time, fadeInStartTime, fadeInEndTime, 0, 1)
                distance += animate(time, fadeInStartTime, fadeInEndTime, -10, 0, x => 1 - ((1 - x) * (1 - x)))
            } else if (time < fadeInStartTime) {
                sprite.alpha = 1
            } else {
                sprite.alpha = animate(time, fadeOutStartTime, fadeOutEndTime, 1, 0)
            }

            sprite.position.copyFrom(startPos.add(direction.mulF(distance)))

            fadeInStartTime += step
            fadeInEndTime += step

            fadeOutStartTime += step
            fadeOutEndTime += step

        }
    }


}