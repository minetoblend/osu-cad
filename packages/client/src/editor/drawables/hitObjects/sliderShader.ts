import {
  Color,
  compileHighShaderGl,
  fragmentGlTemplate,
  globalUniformsBitGl,
  GlProgram,
  localUniformBitGl,
  roundPixelsBitGl,
  Shader,
  Texture,
  TextureShader,
  UniformGroup,
  vertexGlTemplate,
} from 'pixi.js';
import { SliderGradient } from '@/editor/drawables/SliderGradient.ts';

let glProgram: GlProgram | null = null;
let gradient: SliderGradient | null = null;

export class SliderShader extends Shader implements TextureShader {
  texture = Texture.EMPTY;

  constructor() {
    const vertexTemplate = vertexGlTemplate.replace(
      'gl_Position = vec4((modelViewProjectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);',
      'gl_Position = vec4((modelViewProjectionMatrix * vec3(position, 1.0)).xy, aUV.x, 1.0);',
    );

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

    glProgram ??= new GlProgram({
      name: 'slider-shader',
      ...compileHighShaderGl({
        template: {
          vertex: vertexTemplate,
          fragment: fragmentGlTemplate,
        },
        bits: [
          globalUniformsBitGl,
          localUniformBitGl,
          {
            name: 'slider-bit',
            fragment: {
              header: `
              uniform vec4 uComboColor;
              uniform vec4 uBorderColor;
              uniform float uSnakeInProgress;
              uniform float uAlpha;
              uniform sampler2D uGradient;
              
              vec4 lighten(vec4 color, float amount) {
                amount *= 0.5;
                return vec4(
                  min(1.0, color.r * (1.0+ 0.5 * amount) + amount),
                  min(1.0, color.g * (1.0+ 0.5 * amount) + amount),
                  min(1.0, color.b * (1.0+ 0.5 * amount) + amount),
                  color.a
                );
              }
              `,
              main: `
              float progress = 1.0 - vUV.x;
              float distanceAlongPath = vUV.y;
          
              if(distanceAlongPath > uSnakeInProgress) {
                  discard;
              }
          
              vec4 gradientColor = texture(uGradient, vec2(progress, 0.0));
          
              vec4 color = vec4(vec3(gradientColor.r) * uBorderColor.rgb, gradientColor.a);
          
              vec4 innerColor = uComboColor * vec4(vec3(1.0 / 1.1), 1.0);
              vec4 outerColor = lighten(uComboColor, 0.5);
          
              vec4 bodyColor = mix(innerColor, outerColor, gradientColor.b);
              color = mix(color, bodyColor, gradientColor.g);
          
              color *= uAlpha;
              
              outColor = color;
            `,
            },
          },
          roundPixelsBitGl,
        ],
      }),
    });

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
      uSnakeInProgress: { value: 0.0, type: 'f32' },
    });

    super({
      glProgram,
      resources: {
        sliderUniforms,
        uSampler: Texture.EMPTY.source,
        uGradient: gradient.texture.source,
      },
    });
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

  get snakeInProgress(): number {
    return this.resources.sliderUniforms.uniforms.uSnakeInProgress;
  }

  set snakeInProgress(value: number) {
    if (this.resources.sliderUniforms)
      this.resources.sliderUniforms.uniforms.uSnakeInProgress = value;
  }
}
