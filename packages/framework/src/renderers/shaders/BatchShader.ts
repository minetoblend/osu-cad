import {
  colorBit,
  colorBitGl,
  compileHighShaderGlProgram,
  compileHighShaderGpuProgram,
  generateTextureBatchBit,
  getBatchSamplersUniformGroup, Matrix,
  roundPixelsBit,
  roundPixelsBitGl,
  Shader, UniformGroup,
} from "pixi.js";
import { generateTextureLodBatchBitGl } from "./generateTextureBatchBit";
import { maskingBitGl } from "./maskingBit";

export class BatchShader extends Shader
{
  constructor(maxTextures: number)
  {
    const maskingUniforms = new UniformGroup({
      uCornerRadius: { value: 0, type: "f32" },
      uCornerExponent: { value: 2.0, type: "f32" },
      uToMaskingSpace: { value: new Matrix(), type: "mat3x3<f32>" },
      uMaskingRect: { value: new Float32Array(4), type: "vec4<f32>" },
      uIsMasking: { value: 0, type: "i32" },
      uBorderThickness: { value: 0, type: "f32" },
      uBorderColorAlpha: { value: new Float32Array(4), type: "vec4<f32>" },
      uMaskingBlendRange: { value: 1, type: "f32" },
    });

    const glProgram = compileHighShaderGlProgram({
      name: "batch",
      bits: [
        colorBitGl,
        generateTextureLodBatchBitGl(maxTextures, -1.0),
        roundPixelsBitGl,
        maskingBitGl,
      ],
    });

    const gpuProgram = compileHighShaderGpuProgram({
      name: "batch",
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
        maskingUniforms,
      },
    });

    console.log(this);
  }
}
