import type { AudioChannel, AudioManager, Sample } from 'osucad-framework';

import toolHover from './assets/samples/tool-hover.ogg';
import toolSelect from './assets/samples/tool-select.ogg';
import sliderDrag from './assets/samples/slider-drag.ogg';

export class UISamples {
  constructor(
    readonly audioManager: AudioManager,
    readonly channel: AudioChannel,
  ) {}

  toolHover!: Sample;
  toolSelect!: Sample;
  sliderDrag!: Sample;

  async load() {
    await Promise.all([
      this.#loadSample('toolHover', toolHover),
      this.#loadSample('toolSelect', toolSelect),
      this.#loadSample('sliderDrag', sliderDrag),
    ]);
  }

  async #loadSample(property: keyof this, url: string) {
    (this as any)[property] = await this.audioManager.createSampleFromUrl(
      this.channel,
      url,
    );
  }
}
