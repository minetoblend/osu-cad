import { compileHighShaderGl, fragmentGlTemplate, globalUniformsBitGl, GlProgram, localUniformBitGl, roundPixelsBitGl, Shader, Texture } from "pixi.js";

let glProgram: GlProgram | undefined;

export class PathShader extends Shader
{
  constructor()
  {
    const vertexTemplate = `

    in vec3 aPosition;
    in vec2 aUV;

    out vec4 vColor;
    out vec2 vUV;

    {{header}}

    void main(void){

        mat3 worldTransformMatrix = uWorldTransformMatrix;
        mat3 modelMatrix = mat3(
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0
          );
        vec3 position = aPosition;
        vec2 uv = aUV;

        {{start}}

        vColor = vec4(1.0);

        {{main}}

        vUV = uv;

        mat3 modelViewProjectionMatrix = uProjectionMatrix * worldTransformMatrix * modelMatrix;

        gl_Position = vec4((modelViewProjectionMatrix * vec3(position.xy, 1.0)).xy, -position.z, 1.0);

        vColor *= uWorldColorAlpha;

        {{end}}
    }
    `;

    glProgram ??= new GlProgram({
      name: "path-shader",
      ...compileHighShaderGl({
        template: {
          vertex: vertexTemplate,
          fragment: fragmentGlTemplate,
        },
        bits: [
          globalUniformsBitGl,
          localUniformBitGl,
          roundPixelsBitGl,
          {
            name: "texture-bit",
            fragment: {
              header: "uniform sampler2D uTexture;",
              main: "outColor = texture(uTexture, vUV);",
            },
            vertex: {},
          },
        ],
      }),
    });

    super({
      glProgram,
      resources: {
        uTexture: Texture.WHITE.source,
      },
    });
  }

  #texture = Texture.WHITE;

  get texture()
  {
    return this.#texture;
  }

  set texture(value)
  {
    this.#texture = value;
    this.resources.uTexture = value.source;
  }
}
