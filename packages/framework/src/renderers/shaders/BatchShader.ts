import {
  colorBit,
  colorBitGl,
  compileHighShaderGlProgram,
  compileHighShaderGpuProgram,
  generateTextureBatchBitGl,
  getBatchSamplersUniformGroup,
  roundPixelsBit,
  roundPixelsBitGl,
  Shader,
} from 'pixi.js';
import { generateTextureLodBatchBitGl } from './generateTextureBatchBit';
import { maskingBitGl } from './maskingBit';

export class BatchShader extends Shader {
  constructor(maxTextures: number) {
    const glProgram = compileHighShaderGlProgram({
      name: 'batch',
      bits: [
        colorBitGl,
        generateTextureBatchBitGl(maxTextures),
        roundPixelsBitGl,
        maskingBitGl,
      ],
    });

    const gpuProgram = compileHighShaderGpuProgram({
      name: 'batch',
      bits: [
        colorBit,
        generateTextureLodBatchBitGl(maxTextures, -1.0),
        roundPixelsBit,
      ],
    });

    super({
      glProgram,
      gpuProgram,
      resources: {
        batchSamplers: getBatchSamplersUniformGroup(maxTextures),
      },
    });
  }
}
