import { colorBitGl, compileHighShaderGlProgram, localUniformBitGl, Matrix, roundPixelsBitGl, Shader, UniformGroup } from 'pixi.js';

export class CountdownShader extends Shader {
  constructor() {
    const uniforms = new UniformGroup({
      uColor: { value: new Float32Array([1, 1, 1, 1]), type: 'vec4<f32>' },
      uTransformMatrix: { value: new Matrix(), type: 'mat3x3<f32>' },
      uRound: { value: 0, type: 'f32' },
      uProgress: { value: 0, type: 'f32' },
    });

    const glProgram = compileHighShaderGlProgram({
      name: 'countdown',
      bits: [
        colorBitGl,
        localUniformBitGl,
        roundPixelsBitGl,
        {
          name: 'countdown',
          fragment: {
            header: `
              uniform lowp float uProgress;
            
              float sdSegment( vec2 p, vec2 a, vec2 b ) {
                  vec2 pa = p-a, ba = b-a;
                  float h = clamp( dot(pa,ba) / dot(ba,ba), 0.0, 1.0 );
                  return length(pa - ba * h) / 2.0;
              }
              
              float alphaAt(vec2 uv, float progress, float lineWidth, float blendRange) {
                float dist = sdSegment(uv, vec2(-0.5), vec2(-0.5 + min(progress, 1.0), -0.5));
                
                dist /= blendRange;
                lineWidth /= blendRange;
                
                float alpha = clamp(1.0 + (lineWidth - dist) / blendRange, 0.0, 1.0);
                
                return alpha;
              }
            `,
            main: `
              float blendRange = 0.12;
              float glowBlendRange = 0.75;
              float lineWidth = 0.005;
            
              vec2 uv = (vUV - vec2(0.5)) * 3.65;
              
              float progress = uProgress * 4.0;
              
              float alpha = alphaAt(uv, progress, lineWidth, blendRange);
              float glowAlpha = alphaAt(uv, progress, lineWidth, glowBlendRange);
              
              progress -= 1.0;
              
              if (progress > 0.0) {
                uv = vec2(uv.y, -uv.x);
                alpha = max(alpha, alphaAt(uv, progress, lineWidth, blendRange));
                glowAlpha = max(glowAlpha, alphaAt(uv, progress, lineWidth, glowBlendRange));
                progress -= 1.0;
              }
              
              if (progress > 0.0) {
                uv = vec2(uv.y, -uv.x);
                alpha = max(alpha, alphaAt(uv, progress, lineWidth, blendRange));
                glowAlpha = max(glowAlpha, alphaAt(uv, progress, lineWidth, glowBlendRange));
                progress -= 1.0;
              }
              
              if (progress > 0.0) {
                uv = vec2(uv.y, -uv.x);
                alpha = max(alpha, alphaAt(uv, progress, lineWidth, blendRange));
                glowAlpha = max(glowAlpha, alphaAt(uv, progress, lineWidth, glowBlendRange));
                progress -= 1.0;
              }
              
              alpha = pow(alpha, 2.0);
              
              alpha *= 2.0;
              alpha += pow(glowAlpha, 2.0) * 0.15;
              
              outColor = vec4(alpha) * vColor;
            `,
          },
        },
      ],
    });

    super({
      glProgram,
      resources: {
        localUniforms: uniforms,
      },
    });
  }

  get progress() {
    return this.resources.localUniforms.uniforms.uProgress;
  }

  set progress(value) {
    this.resources.localUniforms.uniforms.uProgress = value;
  }
}
