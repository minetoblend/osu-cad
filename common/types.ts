export interface SerializedVec2 {
    x: number
    y: number
}

export interface SerializedBeatmap {
    timingPoints: SerializedTimingPoint[]
    hitObjects: SerializedHitObject[]
    metadata: SerializedBeatmapMetadata
    difficulty: SerializedDifficulty
}

export interface SerializedBeatmapMetadata {
    colors: SerializedColor[]
}

export interface SerializedColor {
    r: number
    g: number
    b: number
}

export interface SerializedTimingPoint {
    id: string
    time: number
    timing?: {
        bpm: number
        signature: number
    }
    sv?: number
    volume?: number
}

export interface SerializedHitObject<Type extends string = 'circle' | 'slider'> {
    id: number
    selectedBy: number | null
    newCombo: boolean

    time: number
    type: Type
    position: SerializedVec2

}

export interface SerializedDifficulty {
    hpDrainRate: number
    circleSize: number
    overallDifficulty: number
    approachRate: number
    sliderMultiplier: number
    sliderTickRate: number
}

export interface SerializedHitCircle extends SerializedHitObject<'circle'> {

}

export interface SerializedSlider extends SerializedHitObject<'slider'> {
    controlPoints: SerializedSliderControlPoint[]
    pixelLength: number
    repeatCount: number
}

export interface SerializedSliderControlPoint {
    position: SerializedVec2
    kind: SliderControlPointType
}

export const enum SliderControlPointType {
    None,
    Bezier,
    Circle,
    Linear,

}