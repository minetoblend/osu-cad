export interface SerializedBeatmapContext {

  hitObjects: SerializedHitObject[]

}

export interface SerializedHitObject {
  type: string
  time: number
  position: { x: number, y: number }
  uuid: string
}

export interface SerializedHitCircle extends SerializedHitObject {
  type: 'hitcircle'
}