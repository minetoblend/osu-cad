import {useEditor} from "@/editor";
import {Container, filters, Sprite, Texture, Transform} from "pixi.js";
import {watchEffect} from "vue";
import {asyncComputed} from "@vueuse/core";

export function createPlayfieldBackground(transform: Transform) {

    const {state} = useEditor()

    const background = state.background

    const sprite = new Sprite()

    const texture = asyncComputed(async () => {
        if (background.value) {
            const texture = await Texture.fromURL(background.value)
            sprite.texture = texture
            return texture
        }
        return null
    })

    watchEffect(() => {
        if (texture.value) {
            const t = texture.value

            sprite.texture = t

            sprite.anchor.set(0.5)
            sprite.position.set(256, 192)

            sprite.scale.set(
                Math.max(640 / t.width, 480 / t.height)
            )

            sprite.visible = true

        } else {
            sprite.visible = false
        }
    })

    sprite.alpha = 0.8

    sprite.zIndex = -1

    const container = new Container()
    container.transform = transform

    container.addChild(sprite)

    return container
}
