import type { DrawableOptions, PIXIGraphics, Sample } from '@osucad/framework';
import { GraphicsDrawable } from '@osucad/framework';
import { mergeAmplitudes } from '../audio/getAmplitudesFromAudioBuffer';
import { getPeaksFromAudioBuffer } from '../audio/getPeaksFromAudioBuffer';

export class DrawableSample extends GraphicsDrawable {
  constructor(readonly sample: Sample, options: DrawableOptions = {}) {
    super();

    this.with(options);
  }

  override updateGraphics(g: PIXIGraphics): void {
    g.clear();

    const pixelSize = this.drawNode.worldTransform.a;

    const sampleSize = (this.sample.length / (this.drawWidth * pixelSize)) / 20;

    const channelAmplitudes = getPeaksFromAudioBuffer(this.sample.buffer, sampleSize);

    const amplitudes = mergeAmplitudes(channelAmplitudes);

    const { drawWidth, drawHeight } = this;

    g.moveTo(0, drawHeight / 2);

    for (let i = 0; i < amplitudes.length; i++) {
      const x = drawWidth * (i / amplitudes.length);
      const y = drawHeight * (0.5 - amplitudes[i] * 0.5);

      g.lineTo(x, y);
    }

    g.stroke({ color: 0xFFFFFF });
  }
}
