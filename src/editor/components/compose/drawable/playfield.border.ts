import {Graphics, Transform} from "pixi.js";
import {UnwrapRef, watchEffect} from "vue";

export function createPlayfieldBorder(transform: UnwrapRef<Transform>) {
    const border = new Graphics();

    watchEffect(() => {
        border.clear()
        border.lineStyle({
            width: 2 / transform.scale.x,
            color: 0xffffff,
            alignment: 1,

        });
        border.drawRoundedRect(0, 0, 512, 384, 1)
        border.transform = transform as Transform
    })


    return border
}

