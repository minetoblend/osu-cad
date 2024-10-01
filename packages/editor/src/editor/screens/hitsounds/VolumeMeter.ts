import type { AudioChannel } from 'osucad-framework';
import {
  Anchor,
  AudioManager,
  Axes,
  Box,
  CompositeDrawable,
  dependencyLoader,
  EasingFunction,
  resolved,
} from 'osucad-framework';
import { OsucadSpriteText } from '../../../OsucadSpriteText.ts';
import 'pixi.js/advanced-blend-modes';

export class VolumeMeter extends CompositeDrawable {
  constructor(
    readonly channel: AudioChannel,
    readonly title: string,
  ) {
    super();
  }

  @resolved(AudioManager)
  audioManager!: AudioManager;

  #analyser!: AnalyserNode;

  #bufferSize = 1024;

  #buffer = new Uint8Array(this.#bufferSize);

  #meter!: Box;

  #delayedMeter!: Box;

  @dependencyLoader()
  load() {
    this.addAllInternal(
      new Box({
        relativeSizeAxes: Axes.Both,
        alpha: 0.1,
      }),
      this.#delayedMeter = new Box({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.BottomLeft,
        origin: Anchor.BottomLeft,
        alpha: 0.1,
        height: 0,
      }),
      this.#meter = new Box({
        relativeSizeAxes: Axes.Both,
        anchor: Anchor.BottomLeft,
        origin: Anchor.BottomLeft,
        alpha: 0.5,
        height: 0,
      }),
      new OsucadSpriteText({
        text: this.title,
        fontSize: 13,
        rotation: Math.PI / 2,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        color: 0xFFFFFF,
      }),
    );

    const analyser = this.#analyser = this.audioManager.context.createAnalyser();

    analyser.fftSize = this.#bufferSize;

    this.channel.input.connect(analyser);
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.channel.input.disconnect(this.#analyser);
  }

  update() {
    super.update();

    this.#analyser.getByteTimeDomainData(this.#buffer);

    let max = 0;
    for (let amplitude of this.#buffer) {
      amplitude = (amplitude - 128) / 128;

      if (amplitude > max)
        max = amplitude;
    }

    this.#meter.height = max;
    if (max > this.#delayedMeter.height) {
      this.#delayedMeter.clearTransforms();

      this.#delayedMeter.height = max;

      this.#delayedMeter.resizeHeightTo(0, 1000, EasingFunction.OutQuad);
    }
  }
}
