import {
  colorBit,
  colorBitGl,
  compileHighShaderGlProgram,
  compileHighShaderGpuProgram,
  generateTextureBatchBit,
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
        generateTextureLodBatchBitGl(maxTextures, -1.0),
        roundPixelsBitGl,
        maskingBitGl,
      ],
    });

    const gpuProgram = compileHighShaderGpuProgram({
      name: 'batch',
      bits: [
        colorBit,
        generateTextureBatchBit(maxTextures),
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
