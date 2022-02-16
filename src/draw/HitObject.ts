import {OsuCadContainer, ResourceProvider} from "@/draw/index";
import {HitCircle} from "@/objects/HitCircle";
import {HitObject} from "@/objects/HitObject";
import {Slider} from "@/objects/Slider";

export class DrawableHitObject<T extends HitObject= HitObject> extends OsuCadContainer {

    constructor(resourceProvider: ResourceProvider, public hitObject: T) {
        super(resourceProvider);
        this.destroy()
    }


    init() {

    }


}

export class DrawableHitCircle extends DrawableHitObject<HitCircle> {

}

export class DrawableSlider extends DrawableHitObject<Slider> {

}