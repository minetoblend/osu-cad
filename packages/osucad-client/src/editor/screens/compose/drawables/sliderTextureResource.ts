// PixiJS V5 Texture-Resource API + canvas2d gradient API + WebGL texImage2D
// Look here for advanced upload function:
// https://github.com/pixijs/pixi.js/blob/dev/packages/core/src/textures/resources/BaseImageResource.js#L54

import { clamp } from "@vueuse/core";
import { BaseTexture, GLTexture, Renderer, Resource } from "pixi.js";

export class SliderTextureResource extends Resource {
  tint = 0xcccccc;
  outlineOnly = false;
  outlineColor = 0xffffff;

  constructor() {
    // pass width and height. (0,0) if we dont know yet
    // gradient needs only 1 pixel height
    super(128, 1);
  }

  upload(renderer: Renderer, baseTexture: BaseTexture, glTexture: GLTexture) {
    const { width } = this; // default size or from baseTexture?
    const { height } = this; // your choice.

    // temporary canvas, we dont need it after texture is uploaded to GPU
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d")!;

    const grd = ctx.createLinearGradient(0, 0, width, 0);

    const r = (this.tint >> 16) & 0xff;
    const g = (this.tint >> 8) & 0xff;
    const b = this.tint & 0xff;

    const brightness = clamp((((r + g + b) / 3) + Math.max(r, g, b)) / 2 * 1.2, 0, 255)

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t
    }

    const rCenter = Math.floor(lerp(r, brightness, 0.45));
    const gCenter = Math.floor(lerp(g, brightness, 0.45));
    const bCenter = Math.floor(lerp(b, brightness, 0.45));

    if (this.outlineOnly) {
      grd.addColorStop(0.25, "transparent");
      grd.addColorStop(0.25, "#" + this.outlineColor.toString(16));
      grd.addColorStop(0.35, "#" + this.outlineColor.toString(16));
      grd.addColorStop(0.35, "transparent");
    } else {
      grd.addColorStop(0.1, "transparent");
      grd.addColorStop(0.25, "rgba(0,0,0, 0.15)");
      grd.addColorStop(0.25, "#" + this.outlineColor.toString(16));
      grd.addColorStop(0.35, "#" + this.outlineColor.toString(16));
      grd.addColorStop(0.35, `rgba(${r},${g},${b},0.89)`);
      grd.addColorStop(1, `rgba(${rCenter},${gCenter},${bCenter},0.89)`);
    }

    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, width, height);

    glTexture.width = width;
    glTexture.height = height;

    const { gl } = renderer;
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(
      baseTexture.target!,
      0,
      baseTexture.format!,
      baseTexture.format!,
      baseTexture.type!,
      canvas
    );

    return true;
  }
}
