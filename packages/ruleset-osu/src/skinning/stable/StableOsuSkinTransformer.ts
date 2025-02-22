import type { ISkinComponentLookup, StableSkin } from '@osucad/core';
import type { Drawable } from '@osucad/framework';
import { Lazy } from '@osucad/framework';
import { OsuSkinComponentLookup } from './OsuSkinComponentLookup';
import { OsuSkinComponents } from './OsuSkinComponents';
import { StableApproachCircle } from './StableApproachCircle';
import { StableCirclePiece } from './StableCirclePiece';
import { StableFollowCircle } from './StableFollowCircle';
import { StableReverseArrow } from './StableReverseArrow';
import { StableSkinTransformer } from './StableSkinTransformer';
import { StableSliderBall } from './StableSliderBall';
import { StableSliderBody } from './StableSliderBody';
import { StableSpinnerBody } from './StableSpinnerBody';

export class StableOsuSkinTransformer extends StableSkinTransformer {
  constructor(source: StableSkin) {
    super(source);
  }

  readonly hasHitcircle = new Lazy(() => this.getTexture('hitcircle') !== null);

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
          if (this.hasHitcircle.value)
            return new StableCirclePiece();

          return null;

        case OsuSkinComponents.ApproachCircle:
          if (this.getTexture('approachcircle') !== null)
            return new StableApproachCircle();

          return null;

        case OsuSkinComponents.SliderHeadHitCircle:
          if (this.hasHitcircle.value)
            return new StableCirclePiece('sliderstartcircle');

          return null;

        case OsuSkinComponents.SliderTailHitCircle:
          if (this.hasHitcircle.value)
            return new StableCirclePiece('sliderendcircle', false);

          return null;

        case OsuSkinComponents.SliderScorePoint:
          return this.source.getSprite('sliderscorepoint');

        case OsuSkinComponents.SliderFollowCircle: {
          const followCircleContent = this.source.getAnimation('sliderfollowcircle', {
            animatable: true,
            looping: true,
            applyConfigFrameRate: true,
          });

          if (followCircleContent)
            return new StableFollowCircle(followCircleContent);

          return null;
        }

        case OsuSkinComponents.ReverseArrow:
          if (this.hasHitcircle.value)
            return new StableReverseArrow();

          return null;

        case OsuSkinComponents.SliderBall:
          if (this.hasHitcircle.value) {
            return new StableSliderBall(
              this.source.getAnimation('sliderb', {
                animatable: true,
                looping: true,
                animationSeparator: '',
              }),
            );
          }

          return null;

        case OsuSkinComponents.SliderBody:
          if (this.hasHitcircle.value)
            return new StableSliderBody();

          return null;

        case OsuSkinComponents.SpinnerBody:
          return new StableSpinnerBody();

        case OsuSkinComponents.Cursor:
          return this.source.getSprite('cursor');

        case OsuSkinComponents.CursorTrail:
          return this.source.getSprite('cursortrail');

        case OsuSkinComponents.HitCircleSelect:
          return this.source.getSprite('hitcircleselect');

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
