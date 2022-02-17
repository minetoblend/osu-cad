import {OsuCadContainer, ResourceProvider} from "@/draw/index";
import {HitCircle} from "@/objects/HitCircle";
import {HitObject} from "@/objects/HitObject";
import {Slider} from "@/objects/Slider";
import {PIXI} from "@/pixi";
import {EditorContext} from "@/objects/Editor";
import {clamp} from "@/util/math";

export abstract class DrawableHitObject<T extends HitObject = HitObject> extends OsuCadContainer {

    constructor(resourceProvider: ResourceProvider, public hitObject: T) {
        super(resourceProvider);
    }

    abstract update(ctx: EditorContext): void

    get timeRelativeToCurrentTime() {
        return this.hitObject.timeRelativeToCurrentTime
    }
}

export class DrawableHitCircle extends DrawableHitObject<HitCircle> {
    private readonly hitcircle: PIXI.Sprite;
    private readonly hitcircleOverlay: PIXI.Sprite;
    private readonly approachCircle: PIXI.Sprite;


    constructor(resourceProvider: ResourceProvider, hitObject: HitCircle) {
        super(resourceProvider, hitObject);

        this.hitcircle = new PIXI.Sprite(resourceProvider.hitCircle!)
        this.hitcircle.anchor.set(0.5, 0.5)

        this.hitcircleOverlay = new PIXI.Sprite(resourceProvider.hitCircleOverlay!)
        this.hitcircleOverlay.anchor.set(0.5, 0.5)

        this.approachCircle = new PIXI.Sprite(resourceProvider.approachCircle!)
        this.approachCircle.anchor.set(0.5, 0.5)

        this.position.set(hitObject.position.x, hitObject.position.y)


        this.scale.set(0.25)

        this.hitcircle.tint = 0xa7c1eb

        this.addChild(this.hitcircle, this.hitcircleOverlay, this.approachCircle)
    }

    update(ctx: EditorContext) {
        const t = this.timeRelativeToCurrentTime
        const fadeinTime = this.hitObject.timeFadeIn
        const preemptTime = this.hitObject.timePreemt

        if (t < 0) { //fade in
            //ApproachCircle.FadeIn(Math.Min(HitObject.TimeFadeIn * 2, HitObject.TimePreempt));
            const a = Math.min(fadeinTime * 2, preemptTime)

            this.approachCircle.alpha = clamp((t + a) / a, 0, 1)

            this.approachCircle.scale.set(
                clamp(4 - ((t + preemptTime)) / preemptTime * 3, 1, 4)
            )
        } else { //fade out

        }

    }
}

export class DrawableSlider extends DrawableHitObject<Slider> {
    update(ctx: EditorContext) {
    }
}