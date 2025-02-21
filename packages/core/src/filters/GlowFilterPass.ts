import type { FilterSystem, RenderSurface, Texture } from 'pixi.js';
import { BlurFilterPass, RendererType, TexturePool } from 'pixi.js';

export class GlowFilterPass extends BlurFilterPass {
  override apply(filterManager: FilterSystem, input: Texture, output: RenderSurface, clearMode: boolean) {
    // @ts-expect-error private property
    this._uniforms.uStrength = this._calculateInitialStrength();

    if (this.passes === 1) {
      filterManager.applyFilter(this, input, output, clearMode);
    }
    else {
      const tempTexture = TexturePool.getSameSizeTexture(input);
      const tempTexture2 = TexturePool.getSameSizeTexture(input);

      let flip = input;
      let flop = tempTexture;

      this._state.blend = false;

      const shouldClear = filterManager.renderer.type === RendererType.WEBGPU;

      for (let i = 0; i < this.passes - 1; i++) {
        filterManager.applyFilter(this, flip, flop, i === 0 ? true : shouldClear);

        const temp = flop;

        flop = flip;
        flip = temp;

        // @ts-expect-error private property
        this._uniforms.uStrength *= 0.5;

        if (flop === input)
          flop = tempTexture2;
      }

      this._state.blend = true;
      filterManager.applyFilter(this, flip, output, clearMode);
      TexturePool.returnTexture(tempTexture);
      TexturePool.returnTexture(tempTexture2);
    }
  }

  /**
   * Calculates the strength for the initial blur pass, so that the total blur amount of all passes will match the filter's
   * strength.
   * @returns The strength for the initial blur pass.
   */
  private _calculateInitialStrength(): number {
    let total = 1;
    let current = 0.5;

    for (let i = 1; i < this.passes; i++) {
      total += current;
      current *= 0.5;
    }

    return this.strength / Math.sqrt(total);
  }
}
