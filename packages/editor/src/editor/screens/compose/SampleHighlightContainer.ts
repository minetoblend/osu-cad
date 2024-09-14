import { Anchor, Axes, CompositeDrawable, dependencyLoader, EasingFunction, resolved } from 'osucad-framework';
import type { SampleType } from '../../../beatmap/hitSounds/SampleType';
import { HitsoundPlayer } from '../../HitsoundPlayer';
import type { HitSample } from '../../../beatmap/hitSounds/HitSample';
import { FastRoundedBox } from '../../../drawables/FastRoundedBox';
import { SampleSet } from '../../../beatmap/hitSounds/SampleSet.ts';
import { NineSliceSprite } from 'pixi.js';

export class SampleHighlightContainer extends CompositeDrawable {
  constructor(
    readonly sampleType: SampleType | SampleType[],
    readonly sampleSet?: SampleSet,
    readonly cornerRadius = 8,
  ) {
    super();
  }

  @resolved(HitsoundPlayer)
  private hitsoundPlayer!: HitsoundPlayer;

  @dependencyLoader()
  load() {
    this.relativeSizeAxes = Axes.Both;

    this.addInternal(this.sampleHighlight);

    this.hitsoundPlayer.samplePlayed.addListener(this.#onSamplePlayed, this);
  }

  #onSamplePlayed(sample: HitSample) {
    if (Array.isArray(this.sampleType)) {
      if (!this.sampleType.includes(sample.sampleType))
        return;
    } else {
      if (sample.sampleType !== this.sampleType)
        return;
    }

    if (this.sampleSet !== undefined && sample.sampleSet !== this.sampleSet)
      return;

    this.scheduler.addOnce(this.addHighlight, this);
  }

  override updateSubTree(): boolean {
    performance.mark('SampleHighlightContainer#updateSubTree');
    const result = super.updateSubTree();
    performance.measure('SampleHighlightContainer#updateSubTree', 'SampleHighlightContainer#updateSubTree');
    return result;
  }

  sampleHighlight = new SampleHighlightSprite(this.cornerRadius);

  addHighlight() {
    if (!this.isAlive)
      return;

    this.sampleHighlight.clearTransforms();
    this.sampleHighlight.scaleTo(1).scaleTo(1.5, 200, EasingFunction.OutQuad);
    this.sampleHighlight.fadeTo(0.2).fadeOut(200, EasingFunction.OutCubic);
    this.sampleHighlight.expire();
  }

  dispose(isDisposing?: boolean) {
    this.hitsoundPlayer.samplePlayed.removeListener(this.#onSamplePlayed);

    super.dispose(isDisposing);
  }
}

class SampleHighlightSprite extends FastRoundedBox {
  constructor(cornerRadius: number) {
    super({
      relativeSizeAxes: Axes.Both,
      alpha: 0,
      cornerRadius,
      anchor: Anchor.Center,
      origin: Anchor.Center,
      blendMode: 'add',
    });
  }

  get removeWhenNotAlive(): boolean {
    return false;
  }
}
