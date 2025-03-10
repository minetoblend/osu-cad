import type { HighShaderBit } from 'pixi.js';

const textureBatchBitGlCache: Record<number, HighShaderBit> = {};

/**
 *
 * @param maxTextures - the max textures the shader can use.
 * @param bias - the lod bias to use when sampling the texture.
 * @returns a shader bit that will allow the shader to sample multiple textures AND round pixels.
 */
function generateSampleLodGlSrc(maxTextures: number, bias: number): string {
  const src = [];

  for (let i = 0; i < maxTextures; i++) {
    if (i > 0) {
      src.push('else');
    }

    if (i < maxTextures - 1) {
      src.push(`if(vTextureId < ${i}.5)`);
    }

    src.push('{');
    src.push(`\toutColor = texture2D(uTextures[${i}], vUV, ${bias.toFixed(1)});`);
    src.push('}');
  }

  return src.join('\n');
}

export function generateTextureLodBatchBitGl(maxTextures: number, bias: number = 0.0): HighShaderBit {
  if (!textureBatchBitGlCache[maxTextures]) {
    textureBatchBitGlCache[maxTextures] = {
      name: 'texture-batch-bit',
      vertex: {
        header: `
                in vec2 aTextureIdAndRound;
                out float vTextureId;

            `,
        main: `
                vTextureId = aTextureIdAndRound.y;
            `,
        end: `
                if(aTextureIdAndRound.x == 1.)
                {
                    gl_Position.xy = roundPixels(gl_Position.xy, uResolution);
                }
            `,
      },
      fragment: {
        header: `
                in float vTextureId;

                uniform sampler2D uTextures[${maxTextures}];

            `,
        main: `

                ${generateSampleLodGlSrc(maxTextures, bias)}
            `,
      },
    };
  }

  return textureBatchBitGlCache[maxTextures];
}
