import {
  compileHighShaderGl,
  compileHighShaderGpuProgram,
  fragmentGlTemplate,
  globalUniformsBitGl,
  GlProgram,
  GpuProgram,
  localUniformBit,
  localUniformBitGl,
  roundPixelsBit,
  roundPixelsBitGl,
  Shader,
  Texture,
  TextureShader,
  vertexGlTemplate,
} from "pixi.js";

let glProgram: GlProgram | null = null;
let gpuProgram: GpuProgram | null = null;

export class SliderShader extends Shader implements TextureShader {

  texture = Texture.EMPTY;

  constructor() {
    const vertexTemplate = vertexGlTemplate
      .replace("gl_Position = vec4((modelViewProjectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);",
        "gl_Position = vec4((modelViewProjectionMatrix * vec3(position, 1.0)).xy, aUV.x, 1.0);");


    glProgram ??= new GlProgram({
      name: "slider-shader",
      ...compileHighShaderGl({
        template: {
          vertex: vertexTemplate,
          fragment: fragmentGlTemplate,
        },
        bits: [
          globalUniformsBitGl,
          localUniformBitGl,
          {
            name: "slider-bit",
            fragment: {
              main: `
              outColor = vec4(vec3(1.0 - vUV.x), 1.0);
            `,
            },
          },
          roundPixelsBitGl,
        ],
      }),
    });

    gpuProgram ??= compileHighShaderGpuProgram({
      name: "slider-bit",
      bits: [
        localUniformBit,
        {
          name: "slider",
          vertex: {
            end: `
              vPosition.z = aUV.x;
            `,
          },
          fragment: {
            main: `
              outColor = vec4<f32>(vec3<f32>(1.0 - vUV.x), 1.0);
            `,
          },
        },
        roundPixelsBit,
      ],
    });


    super({
      glProgram,
      gpuProgram,
      resources: {
        uSampler: Texture.EMPTY.source,
      },
    });

    this.addResource("globalUniforms", 0, 0);
    this.addResource("localUniforms", 1, 0);
  }
}