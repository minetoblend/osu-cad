import {
  FilterSystem,
  Texture,
  TexturePool,
  BlurFilterOptions,
  BlurFilter,
  Filter,
  GpuProgram,
  GlProgram,
  RenderSurface,
  BlurFilterPass,
  BlurFilterPassOptions,
  RendererType,
} from 'pixi.js';

import { vertex, wgslVertex } from 'pixi-filters';
import fragment from './backdrop-blur-blend.frag?raw';
import wgslFragment from './backdrop-blur-blend.wgsl?raw';
import { clamp } from '@vueuse/core';

export class CustomBackdropBlur extends BlurFilter {
  private _blendPass: Filter;
  constructor(options: BlurFilterOptions) {
    super({
      kernelSize: 15,
      ...options,
    });
    this.padding = options.padding ?? 32;

    this.blendRequired = true;
    this.padding = 0;

    this.blurXFilter = new CustomBlurFilterPass({
      kernelSize: 15,
      ...options,
      horizontal: false,
    });
    this.blurYFilter = new CustomBlurFilterPass({
      kernelSize: 15,
      ...options,
      horizontal: true,
    });

    this._blendPass = new Filter({
      gpuProgram: GpuProgram.from({
        vertex: {
          source: wgslVertex,
          entryPoint: 'mainVertex',
        },
        fragment: {
          source: wgslFragment,
          entryPoint: 'mainFragment',
        },
      }),
      glProgram: GlProgram.from({
        vertex,
        fragment,
        name: 'drop-shadow-filter',
      }),
      resources: {
        uBackground: Texture.EMPTY,
      },
    });
  }

  /**
   * Override existing apply method in `Filter`
   * @override
   * @ignore
   */
  public apply(
    filterManager: FilterSystem,
    input: Texture,
    output: RenderSurface,
    clearMode: boolean,
  ): void {
    // @ts-expect-error - this should probably not be grabbed from a private property
    const backTexture = filterManager._activeFilterData.backTexture;

    const blurredBackground = TexturePool.getSameSizeTexture(input);

    super.apply(filterManager, backTexture, blurredBackground, true);

    blurredBackground.source.magFilter = 'linear';
    blurredBackground.source.minFilter = 'linear';
    blurredBackground.source.autoGenerateMipmaps = true;
    blurredBackground.source.updateMipmaps();
    blurredBackground.source.scaleMode = 'linear';
    this['_blendPass'].resources.uBackground = blurredBackground.source;
    this['_blendPass'].apply(filterManager, input, output, clearMode);

    TexturePool.returnTexture(blurredBackground);
  }
}

class CustomBlurFilterPass extends BlurFilterPass {
  constructor(options: BlurFilterPassOptions) {
    super(options);
  }

  apply(
    filterManager: FilterSystem,
    input: Texture,
    output: Texture,
    clearMode: boolean,
  ) {
    const factor = clamp(
      Math.pow(1 / this.strength, (1 / this.passes) * 2),
      0.5,
      1.0,
    );

    let total = 1;
    for (let i = 1; i < this.passes; i++) {
      total += Math.pow(factor, i);
    }
    this['_uniforms'].uStrength = this.strength / Math.sqrt(total);

    if (this.passes === 1) {
      filterManager.applyFilter(this, input, output, clearMode);
    } else {
      const tempTexture = TexturePool.getSameSizeTexture(input);
      let flip = input;
      let flop = tempTexture;
      this._state.blend = false;

      for (let i = 0; i < this.passes - 1; i++) {
        filterManager.applyFilter(
          this,
          flip,
          flop,
          filterManager.renderer.type === RendererType.WEBGPU,
        );
        const temp = flop;
        flop = flip;
        flip = temp;

        this['_uniforms'].uStrength *= factor;
      }
      this._state.blend = true;
      filterManager.applyFilter(this, flip, output, clearMode);
      TexturePool.returnTexture(tempTexture);
    }
  }
}
