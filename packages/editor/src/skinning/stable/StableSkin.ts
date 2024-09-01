import type { Color, Texture } from 'pixi.js';
import type { Drawable, Sample } from 'osucad-framework';
import { Bindable } from 'osucad-framework';
import { Skin } from '../Skin';
import type { IHasComboColors } from '../IHasComboColors';
import type { IHasComboInformation } from '../../beatmap/hitObjects/IHasComboInformation';
import type { IResourceStore } from '../IResourceStore';
import type { ISkinComponentLookup } from '../ISkinComponentLookup';
import { OsuSkinComponentLookup } from '../OsuSkinComponentLookup';
import { OsuSkinComponents } from '../OsuSkinComponents';
import type { IResourcesProvider } from '../../io/IResourcesProvider';
import type { SkinInfo } from '../SkinInfo';
import type { ISampleInfo } from '../ISampleInfo';
import { StableCirclePiece } from './StableCirclePiece';
import { StableApproachCircle } from './StableApproachCircle';
import { StableFollowCircle } from './StableFollowCircle';
import { StableReverseArrow } from './StableReverseArrow';
import { StableSliderBall } from './StableSliderBall';
import { StableSpinnerBody } from './StableSpinnerBody';

export class StableSkin extends Skin {
  getDrawableComponent(lookup: ISkinComponentLookup): Drawable | null {
    const component = super.getDrawableComponent(lookup);
    if (component)
      return component;

    if (lookup instanceof OsuSkinComponentLookup) {
      switch (lookup.component) {
        case OsuSkinComponents.FollowPoint:
          return this.getAnimation('followpoint', {
            animatable: true,
            looping: false,
          });

        case OsuSkinComponents.HitCircle:
          return new StableCirclePiece();

        case OsuSkinComponents.ApproachCircle:
          return new StableApproachCircle();

        case OsuSkinComponents.SliderHeadHitCircle:
        case OsuSkinComponents.SliderTailHitCircle:
          return new StableCirclePiece('sliderendcircle', false);

        case OsuSkinComponents.SliderScorePoint:
          return this.getSprite('sliderscorepoint');

        case OsuSkinComponents.SliderFollowCircle:
          return new StableFollowCircle();

        case OsuSkinComponents.ReverseArrow:
          return new StableReverseArrow();

        case OsuSkinComponents.SliderBall:
          return new StableSliderBall();

        case OsuSkinComponents.SpinnerBody:
          return new StableSpinnerBody();
      }
    }

    return null;
  }

  getComboColor(
    source: IHasComboColors,
    colorIndex: number,
    combo: IHasComboInformation,
  ): Bindable<Color> | null {
    const color = source.comboColors ? source.comboColors[colorIndex % source.comboColors.length] : null;

    return color ? new Bindable(color) : null;
  }

  constructor(info: SkinInfo, resources?: IResourcesProvider, fallbackStore?: IResourceStore<ArrayBuffer>, configurationFilename?: string) {
    super(info, resources, fallbackStore, configurationFilename);
  }

  get allowHighResolutionSprites(): boolean {
    return true;
  }

  async load() {
    await super.load();
    await Promise.all([
      this.loadTexture('hitcircle'),
      this.loadTexture('hitcircleoverlay'),
      this.loadTexture('approachcircle'),
      this.loadTexture('sliderfollowcircle'),
      this.loadTexture('sliderscorepoint'),
      this.loadTexture('sliderstartcircle'),
      this.loadTexture('sliderendcircle'),
      this.loadTexture('reversearrow'),
      this.loadTexture('sliderb-spec'),
      this.loadTexture('hitcircleselect'),
      this.loadAnimation('followpoint', true),
      this.loadTexture('spinner-approachcircle'),
      this.loadTexture('spinner-background'),
      this.loadTexture('spinner-bottom'),
      this.loadTexture('spinner-glow'),
      this.loadTexture('spinner-middle'),
      this.loadTexture('spinner-middle2'),
      this.loadTexture('spinner-top'),
      this.loadTexture('default-0'),
      this.loadTexture('default-1'),
      this.loadTexture('default-2'),
      this.loadTexture('default-3'),
      this.loadTexture('default-4'),
      this.loadTexture('default-5'),
      this.loadTexture('default-6'),
      this.loadTexture('default-7'),
      this.loadTexture('default-8'),
      this.loadTexture('default-9'),
    ]);
  }

  getTexture(componentName: string): Texture | null {
    let texture: Texture | null = null;

    if (this.allowHighResolutionSprites) {
      componentName = componentName.replace('@2x', '');

      const hasExtension = componentName.includes('.');

      const twoTimesFilename = hasExtension
        ? [
            componentName.split('.').slice(0, -1).join('.'),
            '@2x',
            '.',
            componentName.split('.').pop() ?? '',
          ].join('')
        : `${componentName}@2x`;

      texture = this.textures?.get(twoTimesFilename, 2) ?? null;
    }

    texture ??= this.textures?.get(componentName) ?? null;

    return texture;
  }

  canLoadTexture(componentName: string, animation = false) {
    if (this.allowHighResolutionSprites) {
      componentName = componentName.replace('@2x', '');

      const hasExtension = componentName.includes('.');

      const twoTimesFilename = hasExtension
        ? [
            componentName.split('.').slice(0, -1).join('.'),
            '@2x',
            '.',
            componentName.split('.').pop() ?? '',
          ].join('')
        : `${componentName}@2x`;

      if (this.textures?.canLoad(twoTimesFilename)) {
        return true;
      }
    }

    return !!this.textures?.canLoad(componentName);
  }

  async loadTexture(componentName: string, animation = false) {
    let texture: Texture | null = null;

    if (this.allowHighResolutionSprites) {
      componentName = componentName.replace('@2x', '');

      const hasExtension = componentName.includes('.');

      const twoTimesFilename = hasExtension
        ? [
            componentName.split('.').slice(0, -1).join('.'),
            '@2x',
            '.',
            componentName.split('.').pop() ?? '',
          ].join('')
        : `${componentName}@2x`;

      if (this.textures?.canLoad(twoTimesFilename)) {
        texture = await this.textures?.load(twoTimesFilename, 2) ?? null;
      }
    }

    if (!texture && this.textures?.canLoad(componentName))
      texture = await this.textures?.load(componentName) ?? null;

    return texture;
  }

  async loadAnimation(componentName: string, animatable: boolean, animationSeparator: string = '-'): Promise<any> {
    const getFrameName = (frameIndex: number) => `${componentName}${animationSeparator}${frameIndex}`;

    if (!this.textures)
      return;

    let frameCount = 0;

    if (animatable) {
      for (let i = 0; true; i++) {
        if (!this.canLoadTexture(getFrameName(i))) {
          break;
        }

        frameCount++;
      }
      const textures: Promise<any>[] = [];
      for (let i = 0; i < frameCount; i++) {
        textures.push(this.loadTexture(getFrameName(i)));
      }
      await Promise.all(textures);
    }

    if (frameCount === 0)
      await this.loadTexture(componentName);
  }

  getSample(sampleInfo: ISampleInfo): Sample | null {
    return null;
  }
}
