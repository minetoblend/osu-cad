import Presence = nkruntime.Presence;
import Nakama = nkruntime.Nakama;
import {
    SerializedBeatmap,
    SerializedDifficulty,
    SerializedHitCircle,
    SerializedHitObject,
    SerializedSlider,
    SerializedSliderControlPoint,
    SerializedTimingPoint,
    SerializedVec2
} from "@common/types";

export interface EditorState {
    presences: Record<string, {
        presence: Presence
        currentTime: number
        cursorPos: SerializedVec2 | null
        id: string
    }>
    emptyTicks: number
    beatmap: BeatmapState
    needsState: Presence[]

    idCounter: number
}

export function createEditorState(beatmap: SerializedBeatmap, nk: Nakama): EditorState {
    const hitObjects = beatmap.hitObjects
    const timingPoints = beatmap.timingPoints
    const difficulty = beatmap.difficulty

    hitObjects.forEach(it => it.id = it.id || nk.uuidv4())
    timingPoints.forEach(it => it.id = it.id || nk.uuidv4())

    return {
        presences: {},
        emptyTicks: 0,
        beatmap: {
            timingPoints,
            hitObjects,
            difficulty
        },
        needsState: [],
        idCounter: 1000,
    }
}


export type TimingPoint = SerializedTimingPoint
export type HitObject = SerializedHitObject
export type HitCircle = SerializedHitCircle
export type Slider = SerializedSlider
export type SliderControlPoint = SerializedSliderControlPoint
export type Difficulty = SerializedDifficulty

export interface BeatmapState {
    timingPoints: TimingPoint[]
    hitObjects: HitObject[]
    difficulty: Difficulty
}
