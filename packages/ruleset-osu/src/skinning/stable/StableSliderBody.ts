import type { ISkinSource } from '@osucad/core';
import type { ColorSource } from 'pixi.js';
import { ColorUtils, EasingFunction } from '@osucad/framework';
import { Color } from 'pixi.js';

import { DrawableSliderPath } from '../../hitObjects/drawables/DrawableSliderPath';
import { PlaySliderBody } from '../../hitObjects/drawables/PlaySliderBody';

export class StableSliderBody extends PlaySliderBody {
  constructor() {
    super();
  }

  protected override createSliderPath(): DrawableSliderPath {
    return new LegacyDrawableSliderPath();
  }

  protected override getBodyAccentColor(skin: ISkinSource, hitObjectAccentColour: Color): Color {
    return new Color(super.getBodyAccentColor(skin, hitObjectAccentColour)).setAlpha(0.7);
  }
}

class LegacyDrawableSliderPath extends DrawableSliderPath {
  override colorAt(position: number): ColorSource {
    const aa_width = 0;

    const shadow = new Color(0x000000).setAlpha(0.25);
    const outerColour = ColorUtils.darkenSimple(this.accentColor, 0.1);
    const innerColour = ColorUtils.lighten(this.accentColor, 0.5);

    // https://github.com/peppy/osu-stable-reference/blob/3ea48705eb67172c430371dcfc8a16a002ed0d3d/osu!/Graphics/Renderers/MmSliderRendererGL.cs#L59-L70
    const shadow_portion = 1 - (118 / 128);
    const border_portion = 0.1875;

    if (position <= shadow_portion - aa_width)
      return interpolateNonLinear(position, new Color(0x000000).setAlpha(0), shadow, 0, shadow_portion - aa_width);

    if (position <= shadow_portion + aa_width)
      return interpolateNonLinear(position, shadow, this.borderColor, shadow_portion - aa_width, shadow_portion + aa_width);

    if (position <= border_portion - aa_width)
      return this.borderColor;

    if (position <= border_portion + aa_width)
      return interpolateNonLinear(position, this.borderColor, outerColour, border_portion - aa_width, border_portion + aa_width);

    return interpolateNonLinear(position, outerColour, innerColour, border_portion + aa_width, 1);
  }
}

/// <summary>
/// Interpolates between two sRGB <see cref="Colour4"/>s directly in sRGB space.
/// </summary>
function interpolateNonLinear(time: number, startColor: Color, endColor: Color, startTime: number, endTime: number, easing: EasingFunction = EasingFunction.Default) {
  if (startColor.toNumber() === endColor.toNumber())
    return startColor;

  const current = time - startTime;
  const duration = endTime - startTime;

  if (duration === 0 || current <= 0)
    return startColor;

  const t = Math.max(0, Math.min(1, easing(current / duration)));

  const startRgba = startColor.toRgba();
  const endRgba = endColor.toRgba();

  return new Color([
    startRgba.r + t * (endRgba.r - startRgba.r),
    startRgba.g + t * (endRgba.g - startRgba.g),
    startRgba.b + t * (endRgba.b - startRgba.b),
    startRgba.a + t * (endRgba.a - startRgba.a),
  ]);
}
