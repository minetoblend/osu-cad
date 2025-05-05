import type { HighShaderBit } from "pixi.js";

const textureBatchBitGlCache: Record<number, HighShaderBit> = {};

/**
 *
 * @param maxTextures - the max textures the shader can use.
 * @returns a shader bit that will allow the shader to sample multiple textures AND round pixels.
 */
function generateSampleGlSrc(maxTextures: number): string
{
  const src = [];

  for (let i = 0; i < maxTextures; i++)
  {
    if (i > 0)
    {
      src.push("else");
    }

    if (i < maxTextures - 1)
    {
      src.push(`if(vTextureId < ${i}.5)`);
    }

    src.push("{");
    src.push(`\toutColor = (
      texture2D(uTextures[${i}], vUV) + 
      texture2D(uTextures[${i}], vUV + vec2(uSamplingDistance.x, 0.0)) +
      texture2D(uTextures[${i}], vUV + vec2(0.0, uSamplingDistance.y)) +
      texture2D(uTextures[${i}], vUV + uSamplingDistance)
    ) / 2.0;`);
    src.push("}");
  }

  return src.join("\n");
}

export function generateTextureMultisampleBatchBitGl(maxTextures: number): HighShaderBit
{
  if (!textureBatchBitGlCache[maxTextures])
  {
    textureBatchBitGlCache[maxTextures] = {
      name: "texture-batch-bit",
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
                uniform vec2 uSamplingDistance;
            `,
        main: `

                ${generateSampleGlSrc(maxTextures)}
            `,
      },
    };
  }

  return textureBatchBitGlCache[maxTextures];
}
