import {
  Filter,
  GlProgram,
  defaultFilterVert,
  Texture,
  Color,
  UniformGroup,
  GpuProgram,
} from 'pixi.js';
import { SliderGradient } from '../SliderGradient.ts';
import fragment from './SliderFilter.frag?raw';
import source from './SliderFilter.wgsl?raw';

let glProgram: GlProgram | null = null;
let gpuProgram: GpuProgram | null = null;

let gradient: SliderGradient | null = null;

export class SliderFilter extends Filter {
  texture: Texture;

  constructor() {
    glProgram ??= new GlProgram({
      vertex: defaultFilterVert,
      fragment,
      name: 'slider-filter',
    });

    gpuProgram ??= new GpuProgram({
      vertex: {
        source,
        entryPoint: 'mainVertex',
      },
      fragment: {
        source,
        entryPoint: 'mainFragment',
      },
    });

    if (!gradient) {
      gradient = new SliderGradient(0, 0, 1, 0)
        .addColorStop(0.0, 0x000000, 0.0)
        .addColorStop(0.2, 0x000000, 0.125)
        .addColorStop(0.22, 0xff0000)
        .addColorStop(0.3, 0xff0000)
        .addColorStop(0.32, 0xffff00)
        .addColorStop(1.0, 0xffffff);

      gradient.buildLinearGradient();
    }

    const sliderUniforms = new UniformGroup({
      uComboColor: {
        value: new Float32Array(Color.shared.setValue(0xff0000).toArray()),
        type: 'vec4<f32>',
      },
      uBorderColor: {
        value: new Float32Array(Color.shared.setValue(0xffffff).toArray()),
        type: 'vec4<f32>',
      },
      uAlpha: { value: 1.0, type: 'f32' },
      uSnakingDistance: { value: 0.0, type: 'f32' },
    });

    super({
      glProgram,
      gpuProgram,
      resources: {
        sliderUniforms,
        uGradient: gradient.texture.source,
        uGradientSampler: gradient.texture.source.style,
        uBackTexture: Texture.EMPTY,
      },
    });

    this.texture = Texture.EMPTY;
  }

  get comboColor(): number {
    return this.resources.sliderUniforms.uniforms.uComboColor;
  }

  set comboColor(value: number) {
    this.resources.sliderUniforms.uniforms.uComboColor = new Float32Array(
      Color.shared.setValue(value).toArray(),
    );
  }

  get borderColor(): number {
    return this.resources.sliderUniforms.uniforms.uBorderColor;
  }

  set borderColor(value: number) {
    this.resources.sliderUniforms.uniforms.uBorderColor = new Float32Array(
      Color.shared.setValue(value).toArray(),
    );
  }

  get alpha(): number {
    return this.resources.sliderUniforms.uniforms.uAlpha;
  }

  set alpha(value: number) {
    this.resources.sliderUniforms.uniforms.uAlpha = value;
  }

  get snakingDistance(): number {
    return this.resources.sliderUniforms.uniforms.uSnakingDistance;
  }

  set snakingDistance(value: number) {
    this.resources.sliderUniforms.uniforms.uSnakingDistance = value;
  }
}
