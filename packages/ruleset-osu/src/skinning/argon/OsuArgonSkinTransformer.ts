import type { ISkin, ISkinComponentLookup } from '@osucad/core';
import type { Drawable } from '@osucad/framework';
import { SkinTransformer } from '@osucad/core';
import { EmptyDrawable } from '@osucad/framework';
import { OsuSkinComponentLookup, OsuSkinComponents } from '@osucad/ruleset-osu';
import { DefaultApproachCircle } from '../default/DefaultApproachCircle';
import { ArgonFollowCircle } from './ArgonFollowCircle';
import { ArgonMainCirclePiece } from './ArgonMainCirclePiece';
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
      }
    }

    return super.getDrawableComponent(lookup);
  }
}
