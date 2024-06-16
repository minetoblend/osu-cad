in vec2 vTextureCoord;

out vec4 finalColor;

uniform sampler2D uTexture;
uniform sampler2D uBackTexture;
uniform sampler2D uGradient;
uniform vec4 uComboColor;
uniform vec4 uBorderColor;
uniform float uAlpha;

vec4 lighten(vec4 color, float amount) {
  amount *= 0.5;
  return vec4(
    min(1.0, color.r * (1.0+ 0.5 * amount) + amount),
    min(1.0, color.g * (1.0+ 0.5 * amount) + amount),
    min(1.0, color.b * (1.0+ 0.5 * amount) + amount),
    color.a
  );
}

void main()
{
    vec4 data = texture(uTexture, vTextureCoord);

    float progress = data.r;

    vec4 gradientColor = texture(uGradient, vec2(progress, 0.0));

    vec4 color = vec4(vec3(gradientColor.r) * uBorderColor.rgb, gradientColor.a);

    vec4 innerColor = uComboColor * vec4(vec3(1.0 / 1.1), 1.0);
    vec4 outerColor = lighten(uComboColor, 0.5);

    vec4 bodyColor = mix(innerColor, outerColor, gradientColor.b);
    color = mix(color, bodyColor, gradientColor.g);

    color *= uAlpha;

    vec4 front = texture(uTexture, vTextureCoord);
    vec4 back = texture(uBackTexture, vTextureCoord);

    finalColor = color;
}