import {EditorContext} from "@/editor";
import {Container, Graphics, Renderer, Sprite, Texture} from "pixi.js";
import {Ref, watchEffect} from "vue";
import {DrawableHitObject} from "@/editor/viewport/drawable/hitobject";
import {DrawableHitCircle} from "@/editor/viewport/drawable/circle.drawable";
import {HitCircle} from "@/editor/hitobject/circle";
import {DrawableSlider} from "@/editor/viewport/drawable/slider.drawable";
import {Slider} from "@/editor/hitobject/slider";
import {HitObject} from "@/editor/hitobject";
import {DrawableFollowPoint} from "@/editor/viewport/drawable/followPoint.drawable";

export class PlayfieldDrawable extends Container {

    constructor(readonly context: EditorContext, readonly renderer: Renderer, readonly playfiedlScale: Ref<number>) {
        super()

        const bg = new Sprite(Texture.from('https://i.imgur.com/ErWEanT.jpg'))
        bg.anchor.set(0.5)
        bg.position.set(512 / 2, 384 / 2)
        bg.tint = 0x444444
        this.addChild(bg)
        bg.scale.set(0.4)
        // bg.visible = false

        const outline = new Graphics()
        outline.lineStyle({color: 0xffffff, width: 2})
        outline.drawRect(0, 0, 512, 384)

        this.addChild(outline)
        this.addChild(this.#followPointContainer)
        this.addChild(this.#hitObjectContainer)

        watchEffect(() => this.shouldUpdate = true, {})
    }


    #drawableHitObjects = new Map<string, DrawableHitObject>()
    #hitObjectContainer = new Container()

    #drawableFollowPoints = new Map<string, DrawableFollowPoint>()
    #followPointContainer = new Container()

    shouldUpdate = true

    update() {
        if (this.shouldUpdate)
            this.updateHitObjects()
    }

    updateHitObjects() {
        const currentTime = this.context.clock.animatedTime

        const hitObjects = this.context.state.beatmap.hitobjects.getHitObjectsInRange(
            currentTime,
            750,
            1000
        )

        let shouldRemove = new Set(this.#drawableHitObjects.keys())
        let shouldAdd: DrawableHitObject[] = []

        hitObjects.forEach(hitObject => {
            let existing = this.#drawableHitObjects.get(hitObject.id)
            if (existing) {
                shouldRemove.delete(hitObject.id)
                existing.update(currentTime)
            } else {
                const drawable = this.getDrawableFor(hitObject)
                this.#drawableHitObjects.set(hitObject.id, drawable)
                drawable.update(currentTime)
                shouldAdd.push(drawable)
            }
        })

        if (shouldRemove.size > 0) {
            shouldRemove.forEach(id => {
                const drawable = this.#drawableHitObjects.get(id)
                if (drawable) {
                    this.#hitObjectContainer.removeChild(drawable)

                    this.#drawableHitObjects.delete(id)
                    drawable.dispose()
                    drawable.destroy({children: true})
                }
            })
        }

        if (shouldAdd.length > 0)
            this.#hitObjectContainer.addChild(...shouldAdd)

        this.#hitObjectContainer.sortChildren()


        shouldRemove = new Set(this.#drawableFollowPoints.keys())

        let last = hitObjects[0]
        for (let i = 1; i < hitObjects.length; i++) {
            const current = hitObjects[i]
            if (!current.newCombo) {

                shouldRemove.delete(last.id)
                const existing = this.#drawableFollowPoints.get(last.id)
                if (existing) {
                    existing.bind(last, current)
                    existing.update(currentTime)
                } else {
                    const drawable = new DrawableFollowPoint()
                    drawable.bind(last, current)
                    this.#followPointContainer.addChild(drawable)
                    this.#drawableFollowPoints.set(last.id, drawable)
                    drawable.update(currentTime)
                }
            }
            last = current
        }


        if (shouldRemove.size > 0) {
            shouldRemove.forEach(id => {
                const drawable = this.#drawableFollowPoints.get(id)
                if (drawable) {
                    this.#followPointContainer.removeChild(drawable)
                    this.#drawableFollowPoints.delete(id)
                    drawable.destroy({children: true})
                }
            })
        }
    }


    getDrawableFor(object: HitObject): DrawableHitObject {
        if (object instanceof HitCircle) {
            const drawable = new DrawableHitCircle(this.context, this.renderer, this)
            drawable.bindTo(object)
            return drawable
        }
        if (object instanceof Slider) {
            const drawable = new DrawableSlider(this.context, this.renderer, this)
            drawable.bindTo(object)
            return drawable
        }

        throw Error()
    }

    get hitObjectContainer() {
        return this.#hitObjectContainer
    }
}