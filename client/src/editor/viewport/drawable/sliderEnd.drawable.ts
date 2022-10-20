import {Container, Sprite, Texture} from "pixi.js";
import hitcircle from "@/assets/skin/hitcircle.png";
import hitcircleOverlay from "@/assets/skin/hitcircleoverlay.png";

export class DrawableSliderEnd extends Container {
    #hitcircle: Sprite;
    #hitcircleOverlay: Sprite;


    constructor(hasApproachCircle: boolean = true) {
        super()

        this.#hitcircle = new Sprite(Texture.from(hitcircle))
        this.#hitcircleOverlay = new Sprite(Texture.from(hitcircleOverlay))

        this.#hitcircle.anchor.set(0.5, 0.5)
        this.#hitcircleOverlay.anchor.set(0.5, 0.5)

        this.addChild(this.#hitcircle, this.#hitcircleOverlay)
    }

    setTint(tint: number) {
        this.#hitcircle.tint = tint
    }
}