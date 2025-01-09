import type { ColorSource, FilterSystem, RenderSurface } from 'pixi.js';
import { BlurFilter } from 'osucad-framework';
import { Color, Filter, GlProgram, Texture, TexturePool } from 'pixi.js';
import { vertex } from 'pixi-filters';
import fragment from './glow-blend.frag?raw';
import { GlowFilterPass } from './GlowFilterPass';

export interface GlowOptions {
  radius: number;
  color: ColorSource;
  alpha?: number;
  quality?: number;
}

export class BetterGlowFilter extends BlurFilter {
  constructor(options: GlowOptions) {
    const blurOptions = {
      ...BlurFilter.defaultOptions,
      strength: options.radius,
    };

    super(blurOptions);
    this.antialias = 'inherit';
    this.resolution = devicePixelRatio;

    this.blurXFilter = new GlowFilterPass({ horizontal: true, ...options });
    this.blurYFilter = new GlowFilterPass({ horizontal: false, ...options });

    this.#blendPass = new Filter({
      glProgram: GlProgram.from({
        vertex,
        fragment,
        name: 'drop-shadow-filter',
      }),
      resources: {
        uGlow: Texture.EMPTY,
        blendUniforms: {
          uColor: { value: new Float32Array(3), type: 'vec3<f32>' },
          uAlpha: { value: 1, type: 'f32' },
        },
      },
    });

    this.#blendUniforms = this.#blendPass.resources.blendUniforms.uniforms;
    this.#color = new Color();

    this.color = options.color;
    this.alpha = options.alpha ?? 1;
  }

  #blendUniforms: {
    uColor: Float32Array;
    uAlpha: number;
  };

  #blendPass: Filter;

  #color: Color;

  get color(): ColorSource { return this.#color.value as ColorSource; }
  set color(value: ColorSource) {
    this.#color.setValue(value);
    const [r, g, b] = this.#color.toArray();

    this.#blendUniforms.uColor[0] = r;
    this.#blendUniforms.uColor[1] = g;
    this.#blendUniforms.uColor[2] = b;
  }

  #alpha = 0;

  get alpha() {
    return this.#alpha;
  }

  set alpha(value) {
    this.#alpha = value;
  }

  get radius() {
    return this.strength;
  }

  set radius(value) {
    this.strength = value;
    this.padding = this.strength * 3;
  }

  #updateQuality() {
    this.quality = this.alpha >= 0 ? Math.ceil(this.radius / 5) : 1;
  }

  override apply(filterManager: FilterSystem, input: Texture, output: RenderSurface, clearMode: boolean) {
    if (this.alpha <= 0 || this.radius <= 0) {
      this.#blendPass.resources.uGlow = Texture.EMPTY.source;
      this.#blendUniforms.uAlpha = 0;
      this.#blendPass.apply(filterManager, input, output, clearMode);
      return;
    }

    this.#updateQuality();

    const blurOutput = TexturePool.getSameSizeTexture(input);

    super.apply(filterManager, input, blurOutput, true);

    this.#blendUniforms.uAlpha = this.#alpha * (0.5 + this.radius * 0.25);

    this.#blendPass.resources.uGlow = blurOutput;
    this.#blendPass.apply(filterManager, input, output, clearMode);

    TexturePool.returnTexture(blurOutput);
  }
}
