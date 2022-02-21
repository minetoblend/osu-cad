import {PIXI} from "@/pixi";

import HitCircle from '../assets/skin/hitcircle@2x.png'
import HitCircleOverlay from '../assets/skin/hitcircleoverlay@2x.png'
import ApproachCircle from '../assets/skin/approachcircle@2x.png'

export class ResourceProvider {

    readonly loader = new PIXI.Loader()

    hitCircle?: PIXI.Texture
    hitCircleOverlay?: PIXI.Texture
    approachCircle?: PIXI.Texture

    load(): Promise<void> {
        this.loader.onError.add(e => console.trace(e))
        this.loader.add('hitcircle', HitCircle)
        this.loader.add('hitcircleoverlay', HitCircleOverlay)
        this.loader.add('approachcircle', ApproachCircle)

        return new Promise((resolve) => {
            this.loader.load((loader, resources) => {

                this.hitCircle = resources.hitcircle.texture
                this.hitCircleOverlay = resources.hitcircleoverlay.texture
                this.approachCircle = resources.approachcircle.texture


                resolve()
            })
        })
    }
}

export class OsuCadContainer extends PIXI.Container {
    constructor(readonly resourceProvider: ResourceProvider) {
        super();
    }
}