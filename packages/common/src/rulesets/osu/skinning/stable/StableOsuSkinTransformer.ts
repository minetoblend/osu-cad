import type { Drawable } from 'osucad-framework';

import type { ISkinComponentLookup } from '../../../../skinning/ISkinComponentLookup';
import type { StableSkin } from '../../../../skinning/stable/StableSkin';
import { OsuSkinComponentLookup } from './OsuSkinComponentLookup';
import { OsuSkinComponents } from './OsuSkinComponents';
import { StableApproachCircle } from './StableApproachCircle';
import { StableCirclePiece } from './StableCirclePiece';
import { StableFollowCircle } from './StableFollowCircle';
import { StableReverseArrow } from './StableReverseArrow';
import { StableSkinTransformer } from './StableSkinTransformer';
import { StableSliderBall } from './StableSliderBall';
import { StableSpinnerBody } from './StableSpinnerBody';
import { StableTimelineCircle } from './StableTimelineCircle';

export class StableOsuSkinTransformer extends StableSkinTransformer {
  constructor(source: StableSkin) {
    super(source);
  }

  override getDrawableComponent(lookup: ISkinComponentLookup): Drawable | null {
    const component = super.getDrawableComponent(lookup);
    if (component)
      return component;

    if (lookup instanceof OsuSkinComponentLookup) {
      switch (lookup.component) {
        case OsuSkinComponents.FollowPoint:
          return this.source.getAnimation('followpoint', {
            animatable: true,
            looping: false,
            applyConfigFrameRate: true,
          });

        case OsuSkinComponents.HitCircle:
          return new StableCirclePiece();

        case OsuSkinComponents.ApproachCircle:
          return new StableApproachCircle();

        case OsuSkinComponents.SliderHeadHitCircle:
          return new StableCirclePiece('sliderstartcircle');

        case OsuSkinComponents.SliderTailHitCircle:
          return new StableCirclePiece('sliderendcircle', false);

        case OsuSkinComponents.SliderScorePoint:
          return this.source.getSprite('sliderscorepoint');

        case OsuSkinComponents.SliderFollowCircle:
          return new StableFollowCircle();

        case OsuSkinComponents.ReverseArrow:
          return new StableReverseArrow();

        case OsuSkinComponents.SliderBall:
          return new StableSliderBall(
            this.source.getAnimation('sliderb', {
              animatable: true,
              looping: true,
              animationSeparator: '',
            }),
          );

        case OsuSkinComponents.SpinnerBody:
          return new StableSpinnerBody();

        case OsuSkinComponents.Cursor:
          return this.source.getSprite('cursor');

        case OsuSkinComponents.CursorTrail:
          return this.source.getSprite('cursortrail');

        case OsuSkinComponents.HitCircleSelect:
          return this.source.getSprite('hitcircleselect');

        case OsuSkinComponents.TimelineCircle:
          return new StableTimelineCircle();

        case OsuSkinComponents.JudgementGreat:
          return this.source.getAnimation('hit300', {
            animatable: true,
            looping: false,
          });

        case OsuSkinComponents.JudgementOk:
          return this.source.getAnimation('hit100', {
            animatable: true,
            looping: false,
          });

        case OsuSkinComponents.JudgementMeh:
          return this.source.getAnimation('hit50', {
            animatable: true,
            looping: false,
          });

        case OsuSkinComponents.JudgementMiss:
          return this.source.getAnimation('hit0', {
            animatable: true,
            looping: false,
          });
      }
    }

    return null;
  }
}
