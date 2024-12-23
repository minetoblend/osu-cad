import type { JudgementResult } from '../../../hitObjects/JudgementResult';
import {
  Anchor,
  CompositeDrawable,
  EasingFunction,
  type ReadonlyDependencyContainer,
} from 'osucad-framework';
import { HitResult } from '../../../hitObjects/HitResult';
import { SkinnableDrawable } from '../../../skinning/SkinnableDrawable';
import { OsuSkinComponentLookup } from '../skinning/stable/OsuSkinComponentLookup';

export class DrawableJudgement extends CompositeDrawable {
  constructor(readonly result: JudgementResult) {
    super();
  }

  get componentLookup() {
    switch (this.result.type) {
      case HitResult.Great:
        return OsuSkinComponentLookup.JudgementGreat;
      case HitResult.Ok:
        return OsuSkinComponentLookup.JudgementOk;
      case HitResult.Meh:
        return OsuSkinComponentLookup.JudgementMeh;
      case HitResult.Miss:
        return OsuSkinComponentLookup.JudgementMiss;
      default:
        return null;
    }
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.position = this.result.position;
    this.origin = Anchor.Center;

    const componentLookup = this.componentLookup;
    if (!componentLookup) {
      this.fadeOut().expire();
      return;
    }

    this.addInternal(this.mainPiece = new SkinnableDrawable(componentLookup).with({
      anchor: Anchor.Center,
      origin: Anchor.Center,
    }));

    const fade_in_length = 120;
    const fade_out_delay = 500;
    const fade_out_length = 600;

    this.fadeInFromZero(fade_in_length);

    this.delay(fade_out_delay).fadeOut(fade_out_length).expire();

    this.mainPiece.scaleTo(0.9 / 2).scaleTo(1.05 / 2, fade_out_delay + fade_out_length);

    if (this.result.isHit) {
      this
        .scaleTo(0.6)
        .scaleTo(1.1, fade_in_length * 0.8)
        .then()
        .delay(fade_in_length * 0.2)
        .scaleTo(0.9, fade_in_length * 0.2)
        .then()
        .scaleTo(0.95)
        .scaleTo(1, fade_in_length * 0.2);
    }
    else {
      this.scaleTo(1.6).scaleTo(1, 100, EasingFunction.In);

      this.moveTo(this.result.position.add({ x: 0, y: -5 }));
      this.moveTo(this.result.position.add({ x: 0, y: 80 }), fade_out_delay + fade_out_length, EasingFunction.In);
    }

    this.expire();
  }

  mainPiece!: SkinnableDrawable;
}
