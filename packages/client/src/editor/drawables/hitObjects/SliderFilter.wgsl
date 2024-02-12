struct GlobalFilterUniforms {
  uInputSize:vec4<f32>,
  uInputPixel:vec4<f32>,
  uInputClamp:vec4<f32>,
  uOutputFrame:vec4<f32>,
  uGlobalFrame:vec4<f32>,
  uOutputTexture:vec4<f32>,
};

struct SliderUniforms {
  uComboColor: vec4<f32>,
  uBorderColor: vec4<f32>,
  uAlpha:f32,
};

@group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;
@group(0) @binding(1) var uTexture: texture_2d<f32>;
@group(0) @binding(2) var uSampler : sampler;

@group(1) @binding(0) var<uniform> sliderUniforms : SliderUniforms;
@group(1) @binding(1) var uGradient : texture_2d<f32>;
@group(1) @binding(2) var uGradientSampler : sampler;

struct VSOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv : vec2<f32>
  };

fn filterVertexPosition(aPosition:vec2<f32>) -> vec4<f32>
{
    var position = aPosition * gfu.uOutputFrame.zw + gfu.uOutputFrame.xy;

    position.x = position.x * (2.0 / gfu.uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*gfu.uOutputTexture.z / gfu.uOutputTexture.y) - gfu.uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

fn filterTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>
{
    return aPosition * (gfu.uOutputFrame.zw * gfu.uInputSize.zw);
}

fn globalTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>
{
  return  (aPosition.xy / gfu.uGlobalFrame.zw) + (gfu.uGlobalFrame.xy / gfu.uGlobalFrame.zw);
}

fn getSize() -> vec2<f32>
{
  return gfu.uGlobalFrame.zw;
}

@vertex
fn mainVertex(
  @location(0) aPosition : vec2<f32>,
) -> VSOutput {
  return VSOutput(
   filterVertexPosition(aPosition),
   filterTextureCoord(aPosition)
  );
}

fn lighten(color: vec4<f32>, amount: f32) -> vec4<f32> {
  return vec4<f32>(
    min(1.0, color.r * (1.0 + 0.5 * amount) + amount),
    min(1.0, color.g * (1.0 + 0.5 * amount) + amount),
    min(1.0, color.b * (1.0 + 0.5 * amount) + amount),
    color.a
  );
}

@fragment
fn mainFragment(
  @location(0) uv: vec2<f32>,
  @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {

    var data = textureSample(uTexture, uSampler, uv);
    var progress = data.r;

    var gradientColor = textureSample(uGradient, uGradientSampler, vec2<f32>(progress, 0.0));

    var color = vec4<f32>(vec3<f32>(gradientColor.r),gradientColor.a);
    var innerColor = sliderUniforms.uComboColor * vec4<f32>(vec3<f32>(1.0 / 1.1), 1.0);
    var outerColor = lighten(sliderUniforms.uComboColor, 0.25);

    var bodyColor = mix(innerColor, outerColor, gradientColor.b);

    color = mix(color, color * bodyColor, gradientColor.g);

    return color * sliderUniforms.uAlpha;
}