import {SerializedVec2} from "@common/types";

export function almostEquals(a: number, b: number, precision = 0.0001) {
    return Math.abs(a - b) < 0.0001
}


export function Vec2Equals(a: SerializedVec2, b: SerializedVec2, precision = 0.0001) {
    return almostEquals(a.x, b.x, precision) && almostEquals(a.y, b.y, precision)
}