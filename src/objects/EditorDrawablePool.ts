import {DrawableHitCircle, DrawableHitObject, DrawableSlider} from "@/draw/HitObject";
import {HitObject} from "@/objects/HitObject";
import {HitCircle} from "@/objects/HitCircle";
import {Slider} from "@/objects/Slider";
import {EditorContext} from "@/objects/Editor";
import {Playfield} from "@/draw/Playfield";

const VISIBLE_TIME = 5000

export class EditorDrawablePool {

    readonly drawables: Map<String, DrawableHitObject> = new Map<String, DrawableHitObject>()

    readonly playfield: Playfield

    constructor(private readonly context: EditorContext) {
        this.playfield = new Playfield(context.resourceProvider)
    }

    onHitObjectChanged(hitObject: HitObject) {
        const drawable = this.getDrawableForHitObject(hitObject)
        if (drawable) {
            if (Math.abs(hitObject.time - this.context.currentTime) > VISIBLE_TIME) {
                this.removeDrawableHitObject(drawable)
            }
        } else if (Math.abs(hitObject.time - this.context.currentTime) <= VISIBLE_TIME) {
            this.addDrawableHitObject(this.createDrawableForHitObject(hitObject))
        }
    }

    onTimeChanged(time: number, oldTime: number) {
        const keys = this.drawables.keys()
        for (let key of keys) {
            const drawable = this.drawables.get(key)!
            if (Math.abs(drawable.hitObject.time - this.context.currentTime) > VISIBLE_TIME)
                this.removeDrawableHitObject(drawable)
        }
        this.context.hitObjects.filter(hitObject => Math.abs(hitObject.time - time) <= VISIBLE_TIME)
            .forEach(hitObject => this.getDrawableForHitObject(hitObject, true)) //create hitobject if it does not exist yet

    }


    private createDrawableForHitObject<T extends HitObject>(hitObject: T): DrawableHitObject<T> {
        if (hitObject instanceof HitCircle) {
            return new DrawableHitCircle(this.playfield.resourceProvider, hitObject) as DrawableHitObject<T>
        }
        if (hitObject instanceof Slider) {
            return new DrawableSlider(this.playfield.resourceProvider, hitObject) as DrawableHitObject<T>
        }
        throw Error()
    }

    private getDrawableForHitObject<T extends HitObject>(hitObject: T, create: boolean = false): DrawableHitObject<T> {
        let drawable = this.drawables.get(hitObject.uuid)
        if (!drawable && create) {
            drawable = this.addDrawableHitObject(this.createDrawableForHitObject(hitObject))
        }
        return drawable as DrawableHitObject<T>
    }

    private addDrawableHitObject(drawable: DrawableHitObject) {
        this.drawables.set(drawable.hitObject.uuid, drawable)
        return drawable
    }

    private removeDrawableHitObject(drawable: DrawableHitObject) {
        drawable.destroy({children: true})
        this.drawables.delete(drawable.hitObject.uuid)
    }

}