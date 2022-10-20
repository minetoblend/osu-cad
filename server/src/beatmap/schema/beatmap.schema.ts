import {Versioned} from "../../util/migration";
import {HitObjectV1} from "./hitobject.schema";
import {TimingPointV1} from "./timing.schema";

export type BeatmapSchema = BeatmapSchemaV1
export type HitObject = HitObjectV1
export type TimingPoint = TimingPointV1

export interface BeatmapSchemaV1 extends BeatmapSchemaBase<1> {
    hitObjects: HitObjectV1[]
    timingPoints: TimingPointV1[]
    difficulty: DifficultyV1
}

export interface DifficultyV1 {
    hpDrainRate: number
    circleSize: number
    overallDifficulty: number
    approachRate: number
    sliderMultiplier: number
    sliderTickRate: number
}

export interface BeatmapSchemaBase<Version extends number = number> extends Versioned<Version> {
}

export interface SerializedDifficulty {
    hpDrainRate: number
    circleSize: number
    overallDifficulty: number
    approachRate: number
    sliderMultiplier: number
    sliderTickRate: number
}


