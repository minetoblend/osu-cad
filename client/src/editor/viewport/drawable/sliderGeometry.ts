import {Vec2} from "@/util/math";
import {OsuCadWasm} from "@/wasm";


export function createSliderGeometry(points: Vec2[], radius: number, pointy = false, pointyEnds = false) {
    return OsuCadWasm.createSliderGeo(radius, points, pointy, pointyEnds)

}

