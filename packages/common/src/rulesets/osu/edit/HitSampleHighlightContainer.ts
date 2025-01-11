import type { HitSample } from '../../../hitsounds/HitSample';
import { Anchor, Axes, CompositeDrawable, EasingFunction, FastRoundedBox, resolved } from 'osucad-framework';
import { HitsoundPlayer } from '../../../editor/HitsoundPlayer';

export class HitSampleHighlightContainer extends CompositeDrawable {
  constructor(
    readonly testFn: (sample: HitSample) => boolean,
  ) {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  @resolved(HitsoundPlayer, true)
  hitSoundPlayer?: HitsoundPlayer;

  protected override loadComplete() {
    super.loadComplete();

    this.hitSoundPlayer?.samplePlayed.addListener(this.#samplePlayed, this);
  }

  #samplePlayed(sample: HitSample) {
    if (!this.isAlive)
      return;

    if (this.testFn(sample)) {
      const drawable = new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 8,
        blendMode: 'add',
        anchor: Anchor.Center,
        origin: Anchor.Center,
      });

      this.internalChild = drawable;

      drawable.scaleTo(1).scaleTo(1.5, 200, EasingFunction.OutQuad);
      drawable.fadeTo(0.2).fadeOut(200, EasingFunction.OutCubic);
      drawable.expire();
    }
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.hitSoundPlayer?.samplePlayed.removeListener(this.#samplePlayed, this);
  }
}
