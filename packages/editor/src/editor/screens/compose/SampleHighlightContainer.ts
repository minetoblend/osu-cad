import { Anchor, Axes, CompositeDrawable, dependencyLoader, resolved } from 'osucad-framework';
import type { SampleType } from '../../../beatmap/hitSounds/SampleType';
import { HitsoundPlayer } from '../../HitsoundPlayer';
import type { HitSample } from '../../../beatmap/hitSounds/HitSample';
import { FastRoundedBox } from '../../../drawables/FastRoundedBox';

export class SampleHighlightContainer extends CompositeDrawable {
  constructor(readonly sampleType: SampleType) {
    super();
  }

  @resolved(HitsoundPlayer)
  private hitsoundPlayer!: HitsoundPlayer;

  @dependencyLoader()
  load() {
    this.relativeSizeAxes = Axes.Both;

    this.hitsoundPlayer.samplePlayed.addListener(this.#onSamplePlayed, this);
  }

  #onSamplePlayed(sample: HitSample) {
    if (sample.sampleType !== this.sampleType)
      return;

    const sampleHighlight = new FastRoundedBox({
      relativeSizeAxes: Axes.Both,
      alpha: 0.2,
      cornerRadius: 8,
      anchor: Anchor.Center,
      origin: Anchor.Center,
      blendMode: 'add',
    });

    sampleHighlight.scaleTo(1.5, 200);
    sampleHighlight.fadeOut(200);
    sampleHighlight.expire();

    this.addInternal(sampleHighlight);
  }

  dispose(isDisposing?: boolean) {
    this.hitsoundPlayer.samplePlayed.removeListener(this.#onSamplePlayed);

    super.dispose(isDisposing);
  }
}
