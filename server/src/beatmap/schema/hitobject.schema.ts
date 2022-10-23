import {Vec2} from "./general.schema";

export interface HitObjectV1<Type extends 'circle' | 'slider' = 'circle' | 'slider'> {
    id: string
    selectedBy: string | null
    newCombo: boolean

    time: number
    type: Type
    position: Vec2
}

export interface HitCircleV1 extends HitObjectV1<'circle'> {

}

export interface SliderV1 extends HitObjectV1<'slider'> {
    controlPoints: SliderControlPointV1[]
    pixelLength: number
    repeatCount: number
}

export interface SliderControlPointV1 {
    position: Vec2
    kind: SliderControlPointTypeV1
}

export const enum SliderControlPointTypeV1 {
    None,
    Bezier,
    Circle,
    Linear,
}

