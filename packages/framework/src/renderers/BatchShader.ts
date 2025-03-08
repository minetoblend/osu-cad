import {
  colorBit,
  colorBitGl,
  compileHighShaderGlProgram,
  compileHighShaderGpuProgram,
  generateTextureBatchBit,
  generateTextureBatchBitGl,
  getBatchSamplersUniformGroup,
  roundPixelsBit,
  roundPixelsBitGl,
  Shader,
} from 'pixi.js';
import { maskingBitGl } from './shaders/maskingBit';

export class BatchShader extends Shader {
  constructor(maxTextures: number) {
    const glProgram = compileHighShaderGlProgram({
      name: 'batch',
      bits: [
        colorBitGl,
        generateTextureBatchBitGl(maxTextures),
        roundPixelsBitGl,
        // {
        //   name: 'textureRect',
        //   vertex: {
        //     header: `
        //       in vec4 aTextureRect;
        //       in vec2 aBlendRange;
        //
        //       out vec4 vTextureRect;
        //       out vec2 vBlendRange;
        //     `,
        //     main: `
        //       vTextureRect = aTextureRect;
        //
        //       vBlendRange = aBlendRange / vec2(
        //         uProjectionMatrix[0][0],
        //         abs(uProjectionMatrix[1][1])
        //       ) / uResolution;
        //     `,
        //   },
        //   fragment: {
        //     header: `
        //       in vec4 vTextureRect;
        //       in vec2 vBlendRange;
        //
        //       float distanceFromDrawingRect(vec2 texCoord) {
        //         highp vec2 topLeftOffset = texCoord - vTextureRect.xy;
        //         topLeftOffset = vec2(
        //           vBlendRange.x > 0.0 ? topLeftOffset.x / vBlendRange.x : 1.0,
        //           vBlendRange.y > 0.0 ? topLeftOffset.y / vBlendRange.y : 1.0
        //         );
        //
        //         highp vec2 bottomRightOffset = vTextureRect.zw - texCoord;
        //         bottomRightOffset = vec2(
        //           vBlendRange.x > 0.0 ? bottomRightOffset.x / vBlendRange.x : 1.0,
        //           vBlendRange.y > 0.0 ? bottomRightOffset.y / vBlendRange.y : 1.0
        //         );
        //
        //         highp vec2 xyDistance = min(topLeftOffset, bottomRightOffset);
        //
        //         return min(xyDistance.x, xyDistance.y);
        //       }
        //     `,
        //     end: `
        //       float fac = clamp(1.0 - distanceFromDrawingRect(vUV), 0.0, 1.0);
        //
        //       outColor.a *= fac;
        //     `,
        //   },
        // },
        maskingBitGl,
      ],
    });

    console.log(glProgram.fragment);

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
