import type { HighShaderBit } from 'pixi.js';

export const maskingBitGl: HighShaderBit = {
  name: 'masking',
  vertex: {
    header: `
      uniform mat3 uToMaskingSpace;
      in vec2 aBlendRange;
      in vec4 aTextureRect;

      out vec2 vMaskingPosition;
      out vec4 vTexRect;
      out vec2 vBlendRange;
            `,
    main: `
      vMaskingPosition = (uToMaskingSpace * vec3(aPosition, 1.0)).xy;
      vBlendRange = aBlendRange;
      vTexRect = aTextureRect;
      `,
  },
  fragment: {
    header: `
      uniform int uIsMasking;
      uniform float uCornerRadius;
      uniform vec4 uMaskingRect;
      uniform lowp float uBorderThickness;
      uniform lowp vec4 uBorderColorAlpha;
      uniform lowp float uMaskingBlendRange;

      in vec2 vMaskingPosition;
      in vec4 vTexRect;
      in vec2 vBlendRange;

      highp float distanceFromRoundedRect(highp vec2 offset, highp float radius) {
        highp vec2 maskingPosition = vMaskingPosition + offset;

        highp vec2 topLeftOffset = uMaskingRect.xy - maskingPosition;
        highp vec2 bottomRightOffset = maskingPosition - uMaskingRect.zw;

        highp vec2 distanceFromShrunkRect = max(
          bottomRightOffset + vec2(radius),
          topLeftOffset + vec2(radius));

        highp float maxDist = max(distanceFromShrunkRect.x, distanceFromShrunkRect.y);

        if (maxDist <= 0.0) {
          return maxDist;
        } else {
          float cornerExponent = 2.0;

          distanceFromShrunkRect = max(vec2(0.0), distanceFromShrunkRect);
          return pow(pow(distanceFromShrunkRect.x, cornerExponent) + pow(distanceFromShrunkRect.y, cornerExponent), 1.0 / cornerExponent);
        }
      }

      lowp vec4 blend(lowp vec4 src, lowp vec4 dst)
      {
          lowp float finalAlpha = src.a + dst.a * (1.0 - src.a);

          if (finalAlpha == 0.0)
              return vec4(0);

          return vec4(
              (src.rgb + dst.rgb * (1.0 - src.a)) / finalAlpha,
              finalAlpha
          );
      }

      float distanceFromDrawingRect(vec2 texCoord) {
        highp vec2 topLeftOffset = vTexRect.xy - texCoord;
        topLeftOffset = vec2(
          vBlendRange.x > 0.0 ? topLeftOffset.x / vBlendRange.x : 1.0,
          vBlendRange.y > 0.0 ? topLeftOffset.y / vBlendRange.y : 1.0
        );

        highp vec2 bottomRightOffset = texCoord - vTexRect.zw;
        bottomRightOffset = vec2(
          vBlendRange.x > 0.0 ? bottomRightOffset.x / vBlendRange.x : 1.0,
          vBlendRange.y > 0.0 ? bottomRightOffset.y / vBlendRange.y : 1.0
        );

        highp vec2 xyDistance = max(topLeftOffset, bottomRightOffset);

        return max(xyDistance.x, xyDistance.y);
      }

      lowp vec4 getRoundedColor(vec4 texel) {
        if (uIsMasking == 0 && vBlendRange == vec2(0.0))
          return texel * vColor;

        highp float dist = distanceFromRoundedRect(vec2(0.0), uCornerRadius);
        lowp float alphaFactor = 1.0;

        dist /= uMaskingBlendRange;

        float radiusCorrection = uCornerRadius <= 0.0 ? uMaskingBlendRange : max(0.0, uMaskingBlendRange - uCornerRadius);

        float fadeStart = (uCornerRadius + radiusCorrection) / uMaskingBlendRange;

        alphaFactor *= min(fadeStart - dist, 1.0);

        if (vBlendRange.x > 0.0 || vBlendRange.y > 0.0)
          alphaFactor *= clamp(distanceFromDrawingRect(vUV), 0.0, 1.0);

        if (alphaFactor <= 0.0)
          return vec4(0.0);

        //TODO: alphaFactor = pow(alphaFactor, g_AlphaExponent);

        highp float borderStart = 1.0 + fadeStart - uBorderThickness;
        lowp float colorWeight = min(borderStart - dist, 1.0);

        lowp vec4 contentColor = vColor * texel;

        if (colorWeight == 1.0)
          return contentColor * alphaFactor;

        lowp vec4 borderColor = uBorderColorAlpha * alphaFactor;

        if (colorWeight <= 0.0)
          return borderColor;

        contentColor *= alphaFactor;

        return mix(borderColor, contentColor, colorWeight);
      }
            `,
    end: `
          finalColor = getRoundedColor(outColor);
      `,
  },
};
