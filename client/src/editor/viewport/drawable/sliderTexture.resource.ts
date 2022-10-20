// PixiJS V5 Texture-Resource API + canvas2d gradient API + WebGL texImage2D
// Look here for advanced upload function:
// https://github.com/pixijs/pixi.js/blob/dev/packages/core/src/textures/resources/BaseImageResource.js#L54

import {BaseTexture, GLTexture, Renderer, Resource} from "pixi.js";
import {Color} from "@/util/math";

export class SliderTextureResource extends Resource {
    constructor() {
        // pass width and height. (0,0) if we dont know yet
        // gradient needs only 1 pixel height
        super(32, 1);
    }

    tint = Color.white
    outlineOnly = false
    outlineColor = Color.white

    upload(renderer: Renderer, baseTexture: BaseTexture, glTexture: GLTexture) {
        const {width} = this; // default size or from baseTexture?
        const {height} = this; // your choice.

        // temporary canvas, we dont need it after texture is uploaded to GPU
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;


        const ctx = canvas.getContext('2d')!;


        const grd = ctx.createLinearGradient(0, 0, width, 0);
        grd.addColorStop(0.13, this.outlineColor.rgb)
        if (!this.outlineOnly) {
            grd.addColorStop(0.13, this.tint.mulF(0.75).rgba(0.9))
            grd.addColorStop(1,
                this.tint.mulF(1.1)
                    .lerp(this.tint.grayscale, 0.3)
                    .rgba(0.9)
            )
        } else {
            grd.addColorStop(0.13, 'transparent')
        }

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, width, height);

        glTexture.width = width;
        glTexture.height = height;

        const {gl} = renderer;
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        gl.texImage2D(baseTexture.target!, 0, baseTexture.format!, baseTexture.format!, baseTexture.type!, canvas);

        return true;
    }
}