import type { DrawableOptions, PIXIGraphics, Sample } from 'osucad-framework';
import { GraphicsDrawable } from 'osucad-framework';
import { getAmplitudesFromAudioBuffer, mergeAmplitudes } from '../audio/getAmplitudesFromAudioBuffer';

export class DrawableSample extends GraphicsDrawable {
  constructor(readonly sample: Sample, options: DrawableOptions = {}) {
    super();

    this.with(options);
  }

  #amplitudes: number[] = [];

  override updateGraphics(g: PIXIGraphics): void {
    g.clear();

    const channelAmplitudes = getAmplitudesFromAudioBuffer(this.sample.buffer, 0.25);

    const amplitudes = mergeAmplitudes(channelAmplitudes);

    const { drawWidth, drawHeight } = this;

    g.moveTo(0, drawHeight / 2);

    for (let i = 0; i < amplitudes.length; i++) {
      const x = drawWidth * (i / amplitudes.length);
      const y = drawHeight * (0.5 - amplitudes[i] * 0.5);

      g.lineTo(x, y);
    }

    for (let i = amplitudes.length - 1; i >= 0; i--) {
      const x = drawWidth * (i / amplitudes.length);
      const y = drawHeight * (0.5 + amplitudes[i] * 0.5);

      g.lineTo(x, y);
    }

    g.closePath();

    g.fill({ color: 0xFFFFFF });
  }
}
