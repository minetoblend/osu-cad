import {HitObject} from "@/objects/HitObject";
import {Timing} from "@/objects/Timing";
import {ResourceProvider} from "@/draw";
import {clamp, Vec2} from "@/util/math";
import {reactive, ref, watch} from "vue";
import {Difficulty} from "@/objects/Difficulty";
import {OsuCadConnector} from "@/networking/connector";
import {Subject} from 'rxjs'
import {SelectionManager} from "@/objects/selection.manager";

export class EditorContext {

  readonly timing = new Timing()

  private readonly _hitObjects: HitObject[] = []

  readonly mode = ref<'compose'>('compose')

  readonly difficulty = reactive<Difficulty>({
    healthDrain: 5,
    circleSize: 4,
    approachRate: 9,
    overallDifficulty: 8,
  })

  readonly selectionManager: SelectionManager

  currentTime = ref(0)

  songDuration = ref(5000)

  constructor(readonly resourceProvider: ResourceProvider, readonly connector: OsuCadConnector) {

    connector.context = this
    connector.init()

    this.selectionManager = new SelectionManager(this)

    watch(this.currentTime, (time) => this.onCurrentTimeUpdate.next(time))
  }

  get hitObjects() {
    return this._hitObjects as ReadonlyArray<HitObject>
  }

  readonly onHitObjectUpdate = new Subject<HitObject>()
  //    this.drawablePool.onHitObjectChanged(hitObject)

  readonly onCurrentTimeUpdate = new Subject<number>()
  //this.drawablePool.onTimeChanged(time, oldTime)

  readonly onHitObjectAdded = new Subject<HitObject>()

  readonly onHitObjectRemoved = new Subject<HitObject>()

  addHitObject(hitObject: HitObject) {
    hitObject.context = this
    this._hitObjects.push(hitObject)
    this.onHitObjectAdded.next(hitObject)
  }

  removeHitObject(hitObject: HitObject) {
    const index = this.hitObjects.indexOf(hitObject)
    if (index >= 0) {
      this._hitObjects.splice(index, 1)
      this.onHitObjectRemoved.next(hitObject)
    }
  }

  get visibleObjects() {
    return this.hitObjects.filter(hitObject =>
      hitObject.time > this.currentTime.value - 1000 && hitObject.time < this.currentTime.value + 1000
    )
  }

  setCurrentTimeRelative(time: number) {
    this.currentTime.value = clamp(Math.floor(time * this.songDuration.value), 0, this.songDuration.value)
  }

  removeHitObjectByUuid(uuid: string) {
    const hitObject = this.hitObjects.find(hitObject => hitObject.uuid === uuid)
    if (hitObject)
      this.removeHitObject(hitObject)
  }

  getHitObjectAt(time: number, position: Vec2): HitObject | undefined {
    const hitObjects = this.visibleObjects

    return hitObjects.find(it => it.contains(position))
  }
}