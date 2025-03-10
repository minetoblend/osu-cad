import { colorBitGl, compileHighShaderGlProgram, getBatchSamplersUniformGroup, localUniformBitGl, Matrix, roundPixelsBitGl, Shader, UniformGroup } from 'pixi.js';
import { generateTextureLodBatchBitGl } from '../../renderers/shaders/generateTextureBatchBit';
import { maskingBitGl } from '../../renderers/shaders/maskingBit';

export class TextShader extends Shader {
  constructor(maxTextures: number) {
    const uniforms = new UniformGroup({
      uColor: { value: new Float32Array([1, 1, 1, 1]), type: 'vec4<f32>' },
      uTransformMatrix: { value: new Matrix(), type: 'mat3x3<f32>' },
      uRound: { value: 0, type: 'f32' },
    });

    const glProgram = compileHighShaderGlProgram({
      name: 'osucad-bitmap-text',
      bits: [
        colorBitGl,
        generateTextureLodBatchBitGl(maxTextures, -1.0),
        localUniformBitGl,
        roundPixelsBitGl,
        maskingBitGl,
        {
          name: 'masking-local',
          vertex: {
            main: `
              toMaskingSpace *= uTransformMatrix;
            `,
          },
        },
      ],
    });

    super({
      glProgram,
      resources: {
        localUniforms: uniforms,
        batchSamplers: getBatchSamplersUniformGroup(maxTextures),
      },
    });
  }
}
