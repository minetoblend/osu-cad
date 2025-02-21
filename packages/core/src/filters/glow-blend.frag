precision highp float;
in vec2 vTextureCoord;
out vec4 finalColor;

uniform sampler2D uTexture;
uniform sampler2D uGlow;

uniform vec3 uColor;
uniform float uAlpha;
uniform float uOriginalAlpha;

void main(void){
    vec4 glow = texture(uGlow, vTextureCoord);
    vec4 original = texture(uTexture, vTextureCoord) * uOriginalAlpha;

    float glowAlpha = glow.a * (1.0 - original.a) * uAlpha;
    float glowStrength = min(1.0 - original.a, glowAlpha);
    vec4 glowColor = glowStrength * vec4(vec3(1), glow.a) * vec4(uColor, 1);

    finalColor = original + glowColor;
}
