import {DrawableHitCircle, DrawableHitObject, DrawableSlider} from "@/draw/HitObject";
import {HitObject} from "@/objects/HitObject";
import {HitCircle} from "@/objects/HitCircle";
import {Slider} from "@/objects/Slider";
import {EditorContext} from "@/objects/Editor";
import {Playfield} from "@/components/screen/compose/playfield";

const VISIBLE_TIME = 5000

export class HitObjectDrawManager {

  readonly drawables: Map<String, DrawableHitObject> = new Map<String, DrawableHitObject>()


  constructor(private readonly context: EditorContext, readonly playfield: Playfield) {
    this.context.onCurrentTimeUpdate.subscribe(time => this.onTimeChanged(time))
    this.context.onHitObjectAdded.subscribe(hitObject => this.onHitObjectAdded(hitObject))
    this.context.onHitObjectUpdate.subscribe(hitObject => this.onHitObjectChanged(hitObject))
    this.context.onHitObjectRemoved.subscribe(hitObject => this.onHitObjectRemoved(hitObject))
  }

  onHitObjectChanged(hitObject: HitObject) {
    const drawable = this.getDrawableForHitObject(hitObject)
    if (drawable) {
      if (Math.abs(hitObject.time - this.context.playback!.currentTime.value) > VISIBLE_TIME) {
        this.removeDrawableHitObject(drawable)
      }
    } else if (Math.abs(hitObject.time - this.context.playback!.currentTime.value) <= VISIBLE_TIME) {
      this.addDrawableHitObject(this.createDrawableForHitObject(hitObject))
    }
  }

  onHitObjectAdded(hitObject: HitObject) {
    this.onHitObjectChanged(hitObject)
  }

  onHitObjectRemoved(hitObject: HitObject) {
    const drawable = this.getDrawableForHitObject(hitObject)
    if (drawable)
      this.removeDrawableHitObject(drawable)
  }

  onTimeChanged(time: number) {
    const keys = this.drawables.keys()
    for (let key of keys) {
      const drawable = this.drawables.get(key)!
      if (Math.abs(drawable.hitObject.time - this.context.playback!.currentTime.value) > VISIBLE_TIME)
        this.removeDrawableHitObject(drawable)
    }
    this.context.hitObjects.filter(hitObject => Math.abs(hitObject.time - time) <= VISIBLE_TIME)
      .forEach(hitObject => this.getDrawableForHitObject(hitObject, true)) //create hitobject if it does not exist yet

    this.drawables.forEach(d => d.update(this.context))
  }


  private createDrawableForHitObject<T extends HitObject>(hitObject: T): DrawableHitObject<T> {
    if (hitObject instanceof HitCircle) {
      return new DrawableHitCircle(this.playfield.resourceProvider, hitObject) as unknown as DrawableHitObject<T>
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
    drawable.update(this.context)
    this.playfield.addHitObjectDrawable(drawable)
    return drawable
  }

  private removeDrawableHitObject(drawable: DrawableHitObject) {
    drawable.destroy({children: true})
    this.playfield.removeHitObjectDrawable(drawable)
    this.drawables.delete(drawable.hitObject.uuid)
  }

  updateAll() {
    const drawables = this.drawables.values()
    for (let drawable of drawables) {
      drawable.update(this.context)
    }
  }
}