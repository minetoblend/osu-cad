import {io, Socket} from 'socket.io-client'
import {readonly, ref} from "vue";
import {EditorContext} from "@/objects/Editor";
import {SerializedBeatmapContext, SerializedHitCircle, SerializedHitObject} from "@/networking/types";
import {HitCircle} from "@/objects/HitCircle";
import {Vec2} from "@/util/math";
import {HitObject} from "@/objects/HitObject";

interface ServerToClientEvents {
  loadContext: (context: SerializedBeatmapContext) => void

  createHitObject: (hitObject: { user: string, hitObject: SerializedHitObject }) => void
  removeHitObject: (evt: { user: string, hitObject: string }) => void
}

interface ClientToServerEvents {
  createHitCircle: (hitObject: SerializedHitCircle) => void
  removeHitObject: (hitObject: string) => void
}

export class OsuCadConnector {

  private socket!: Socket<ServerToClientEvents, ClientToServerEvents>;

  private $connected = ref(false)
  public readonly connected = readonly(this.$connected)

  //gets initialized in the EditorContext constructor, we can assume this always holds a value
  context!: EditorContext

  constructor(readonly url: string, readonly beatmapId: string) {
  }

  private onConnect() {
    this.$connected.value = true
  }


  loadContext(context: SerializedBeatmapContext) {
    this.context.songDuration.value = context.beatmapSet.duration
    this.context.beatmapSetId = context.beatmapSet.id
    context.hitObjects.forEach(serializedHitObject => {
        const hitObject = deserializeHitObject(serializedHitObject)
        if (hitObject) {
          this.context.addHitObject(hitObject)
        }
      }
    )
    this.context.loadAudio()
  }

  private initializeCallbacks() {
    this.socket.on('loadContext', serializedContext => this.loadContext(serializedContext))
    this.socket.on('createHitObject', evt => this.addHitObject(evt.hitObject))
    this.socket.on('removeHitObject', evt => this.context.removeHitObjectByUuid(evt.hitObject))
    this.socket.onAny((command, ...args) => console.log('command: ', command, args))
  }

  init() {
    this.socket = io(this.url, {
      path: '/api/edit/endpoint',
      query: {
        beatmap: this.beatmapId
      },
    })

    this.socket.on('connect', () => {
      this.onConnect()
    })

    this.initializeCallbacks()
  }

  createHitCircle(hitObject: HitCircle) {
    this.socket.emit('createHitCircle', hitObject.serialize())
  }

  removeHitObject(hitObject: HitObject) {
    this.socket.emit('removeHitObject', hitObject.uuid)
  }

  private addHitObject(hitobject: SerializedHitObject) {
    const deserializedHitObject = deserializeHitObject(hitobject)
    if (deserializedHitObject)
      this.context.addHitObject(deserializedHitObject)
  }


}

function deserializeHitObject(serializedHitObject: SerializedHitObject) {
  switch (serializedHitObject.type) {
    case 'hitcircle':
      const dto = serializedHitObject as SerializedHitCircle
      const hitObject = new HitCircle()

      hitObject.time = dto.time
      hitObject.position = new Vec2(dto.position.x, dto.position.y)
      hitObject.uuid = dto.uuid
      return hitObject
  }
}