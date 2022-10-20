import {Texture} from "pixi.js";
import {BackdropFilter} from "@pixi/picture";
import {generateBlurFragSource} from "@/editor/viewport/drawable/shader/generateBlurFragSource";
import {generateBlurVertSource} from "@/editor/viewport/drawable/shader/generateBlurVertSource";

export class BackdropBlurFilter extends BackdropFilter {
    constructor(x: boolean, fromBackdrop: boolean, strength = 0.004) {
        const kernelSize = 11;
        super(generateBlurVertSource(kernelSize, x), generateBlurFragSource(kernelSize, fromBackdrop), {
            backdropSampler: Texture.WHITE.baseTexture,
            uBackdrop_flipY: new Float32Array(2),
            strength,
        });
        this.backdropUniformName = 'backdropSampler';
    }

    get size() {
        return this.uniforms.size;
    }

    set size(value) {
        if (typeof value === 'number') {
            value = [value, value];
        }
        this.uniforms.size = value;
    }
}