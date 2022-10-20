import initWasm, {createSliderGeo, InitOutput} from 'osucad-wasm'
import {Vec2} from "@/util/math";

let wasmModule!: OsuCadWasm;

async function init() {

    wasmModule = new OsuCadWasm()
}

export class OsuCadWasm {
    private static module?: InitOutput;

    static async init() {
        if (this.module)
            return;
        this.module = await initWasm()
    }

    static createSliderGeo(radius: number, path: Vec2[], pointy = false, pointyEnds = false): { vertices: number[], indices: number[] } {
        return createSliderGeo(radius, path, pointy, pointyEnds)
    }
}

