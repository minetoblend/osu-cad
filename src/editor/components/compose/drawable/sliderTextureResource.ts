// PixiJS V5 Texture-Resource API + canvas2d gradient API + WebGL texImage2D
// Look here for advanced upload function:
// https://github.com/pixijs/pixi.js/blob/dev/packages/core/src/textures/resources/BaseImageResource.js#L54

import {BaseTexture, GLTexture, Renderer, Resource} from "pixi.js";

export class SliderTextureResource extends Resource {
    tint = 0xffffff
    outlineOnly = false
    outlineColor = '#ffffff'

    constructor() {
        // pass width and height. (0,0) if we dont know yet
        // gradient needs only 1 pixel height
        super(128, 1);
    }

    upload(renderer: Renderer, baseTexture: BaseTexture, glTexture: GLTexture) {
        const {width} = this; // default size or from baseTexture?
        const {height} = this; // your choice.

        // temporary canvas, we dont need it after texture is uploaded to GPU
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;


        const ctx = canvas.getContext('2d')!;


        const grd = ctx.createLinearGradient(0, 0, width, 0);


        if (!this.outlineOnly) {
            grd.addColorStop(0.1, 'transparent');
            grd.addColorStop(0.25, 'rgba(0,0,0, 0.15)');
            grd.addColorStop(0.25, 'white');
            grd.addColorStop(0.35, 'white');
            grd.addColorStop(0.35, '#fcba03')
            grd.addColorStop(1,
                'rgba(255,193,25,0.89)'
            )
        } else {
            grd.addColorStop(0.13, '#ffffff')
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
