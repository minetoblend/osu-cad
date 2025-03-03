import type { DrawableHitObject, HitWindows, JudgementResult } from '@osucad/common';
import { Beatmap, DrawableHitCircle, HitResult, OsuHitWindows, OsuPlayfield } from '@osucad/common';
import { Anchor, Axes, CompositeDrawable, dependencyLoader, FastRoundedBox, resolved } from 'osucad-framework';

export class HitErrorBar extends CompositeDrawable {
  @resolved(OsuPlayfield)
  playfield!: OsuPlayfield;

  @resolved(Beatmap)
  beatmap!: Beatmap;

  @dependencyLoader()
  load() {
    this.anchor = Anchor.BottomCenter;
    this.origin = Anchor.BottomCenter;

    this.y = -15;

    this.width = 250;
    this.height = 4;

    const hitWindows = new OsuHitWindows();
    hitWindows.setDifficulty(this.beatmap.difficulty.overallDifficulty);

    const maxHitWindow = hitWindows.windowFor(HitResult.Meh);

    this.addAllInternal(
      new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        color: 0xFAEA5C,
        cornerRadius: 2,
      }),
      new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        color: 0x45F7F4,
        cornerRadius: 2,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        width: hitWindows.windowFor(HitResult.Ok) / maxHitWindow,
      }),
      new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        color: 0x45F751,
        cornerRadius: 2,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        width: hitWindows.windowFor(HitResult.Great) / maxHitWindow,
      }),
      new FastRoundedBox({
        relativeSizeAxes: Axes.Y,
        width: 4,
        alpha: 0.5,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        color: 0x52CCA3,
        cornerRadius: 2,
      }),
    );

    this.playfield.newResult.addListener(this.#onNewResult, this);
  }

  #onNewResult([drawableHitObject, result]: [DrawableHitObject, JudgementResult]) {
    const hitWindows = drawableHitObject.hitObject!.hitWindows;

    if (!result.isHit)
      return;

    if (drawableHitObject instanceof DrawableHitCircle)
      this.addInternal(new ResultMarker(result, hitWindows));
  }
}

class ResultMarker extends FastRoundedBox {
  constructor(readonly result: JudgementResult, readonly hitWindows: HitWindows) {
    super({
      relativePositionAxes: Axes.X,
      width: 3,
      height: 10,
      cornerRadius: 1.5,
    });
  }

  @dependencyLoader()
  load() {
    this.anchor = Anchor.Center;
    this.origin = Anchor.Center;

    const missWindow = this.hitWindows.windowFor(HitResult.Meh);

    this.x = this.result.timeOffset / missWindow / 2;
  }

  protected loadComplete() {
    super.loadComplete();

    this.fadeTo(0.85).fadeOut(2500).expire();
  }
}
