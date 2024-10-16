import type {
  GlProgram,
} from 'pixi.js';
import {
  compileHighShaderGlProgram,
  localUniformBitGl,
  roundPixelsBitGl,
  Shader,
  UniformGroup,
} from 'pixi.js';

let glProgram: GlProgram | null = null;

export class SliderBallShader extends Shader {
  constructor() {
    const ballUniforms = new UniformGroup({
      uAngle: { type: 'f32', value: 0 },
    });

    glProgram ??= compileHighShaderGlProgram({
      name: 'mesh',
      bits: [
        localUniformBitGl,
        roundPixelsBitGl,
        {
          fragment: {
            header: /* glsl */ `
          uniform float uAngle;
        `,
            main: /* glsl */ `
          #define PI 3.1415926535897932384626433832795

          vec2 circlePos = (vUV - 0.5) * 2.0;

          circlePos /= 0.95;

          float distance = length(circlePos);

          if (distance > 1.0) {
            discard;
          }

          float alpha = 1.0 - smoothstep(0.975, 1.0, distance);

          vec3 dir = vec3(
            circlePos.xy,
            sqrt(1.0 - dot(circlePos.xy, circlePos.xy))
          );

          float angle = atan(dir.x, dir.z) - uAngle;

          float stripe = smoothstep(-0.05, 0.05, cos(angle * 4.0));

          vec3 color = vec3(stripe);

          float brightness = dot(dir, vec3(0.0, 1.0, 0.0));

          color *= brightness * 0.25 + 0.75;

          outColor = vec4(color, 1.0) * alpha;
        `,
          },
        },
      ],
    });

    super({
      glProgram,
      resources: {
        ballUniforms,
      },
    });
  }

  get angle() {
    return this.resources.ballUniforms.uniforms.uAngle;
  }

  set angle(value: number) {
    this.resources.ballUniforms.uniforms.uAngle = value;
  }
}
