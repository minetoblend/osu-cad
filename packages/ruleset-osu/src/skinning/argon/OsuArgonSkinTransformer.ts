import type { ISkin, ISkinComponentLookup } from '@osucad/core';
import type { Drawable } from '@osucad/framework';
import { SkinConfig, SkinTransformer } from '@osucad/core';
import { EmptyDrawable } from '@osucad/framework';
import { OsuSkinComponentLookup, OsuSkinComponents } from '@osucad/ruleset-osu';
import { DefaultApproachCircle } from '../default/DefaultApproachCircle';
import { ArgonFollowCircle } from './ArgonFollowCircle';
import { ArgonFollowPoint } from './ArgonFollowPoint';
import { ArgonMainCirclePiece } from './ArgonMainCirclePiece';
import { ArgonReverseArrow } from './ArgonReverseArrow';
import { ArgonSliderBall } from './ArgonSliderBall';
import { ArgonSliderBody } from './ArgonSliderBody';

export class OsuArgonSkinTransformer extends SkinTransformer {
  constructor(source: ISkin) {
    super(source);
  }

  override getDrawableComponent(lookup: ISkinComponentLookup): Drawable | null {
    if (lookup instanceof OsuSkinComponentLookup) {
      switch (lookup.component) {
        case OsuSkinComponents.HitCircle:
          return new ArgonMainCirclePiece(true);

        case OsuSkinComponents.SliderHeadHitCircle:
          return new ArgonMainCirclePiece(false);

        case OsuSkinComponents.SliderTailHitCircle:
          return new EmptyDrawable();

        case OsuSkinComponents.SliderBody:
          return new ArgonSliderBody();

        case OsuSkinComponents.ApproachCircle:
          return new DefaultApproachCircle();

        case OsuSkinComponents.SliderBall:
          return new ArgonSliderBall();

        case OsuSkinComponents.SliderFollowCircle:
          return new ArgonFollowCircle();

        case OsuSkinComponents.ReverseArrow:
          return new ArgonReverseArrow();

        case OsuSkinComponents.FollowPoint:
          return new ArgonFollowPoint();
      }
    }

    return super.getDrawableComponent(lookup);
  }

  override getConfig<T>(key: SkinConfig<T>): T | null;

  override getConfig<T>(key: SkinConfig<T>): any {
    if (key === SkinConfig.HitCircleOverlap)
      return 16;

    return super.getConfig(key);
  }
}
