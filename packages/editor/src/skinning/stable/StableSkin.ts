import type { Drawable } from 'osucad-framework';
import type { Color, Texture } from 'pixi.js';
import type { IHasComboInformation } from '../../beatmap/hitObjects/IHasComboInformation';
import type { IResourcesProvider } from '../../io/IResourcesProvider';
import type { IHasComboColors } from '../IHasComboColors';
import type { IResourceStore } from '../IResourceStore';
import type { ISkinComponentLookup } from '../ISkinComponentLookup';
import type { SkinInfo } from '../SkinInfo';
import { Bindable } from 'osucad-framework';
import { OsuSkinComponentLookup } from '../OsuSkinComponentLookup';
import { OsuSkinComponents } from '../OsuSkinComponents';
import { Skin } from '../Skin';
import { StableApproachCircle } from './StableApproachCircle';
import { StableCirclePiece } from './StableCirclePiece';
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
          return this.getSprite('sliderscorepoint');

        case OsuSkinComponents.SliderFollowCircle:
          return new StableFollowCircle();

        case OsuSkinComponents.ReverseArrow:
          return new StableReverseArrow();

        case OsuSkinComponents.SliderBall:
          return new StableSliderBall(
            this.getAnimation('sliderb', {
              animatable: true,
              looping: true,
              animationSeparator: '',
            }),
          );

        case OsuSkinComponents.SpinnerBody:
          return new StableSpinnerBody();

        case OsuSkinComponents.Cursor:
          return this.getSprite('cursor');

        case OsuSkinComponents.CursorTrail:
          return this.getSprite('cursortrail');

        case OsuSkinComponents.HitCircleSelect:
          return this.getSprite('hitcircleselect');

        case OsuSkinComponents.JudgementGreat:
          return this.getAnimation('hit300', {
            animatable: true,
            looping: false,
          });

        case OsuSkinComponents.JudgementOk:
          return this.getAnimation('hit100', {
            animatable: true,
            looping: false,
          });

        case OsuSkinComponents.JudgementMeh:
          return this.getAnimation('hit50', {
            animatable: true,
            looping: false,
          });

        case OsuSkinComponents.JudgementMiss:
          return this.getAnimation('hit0', {
            animatable: true,
            looping: false,
          });
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

  constructor(info: SkinInfo, resources: IResourcesProvider, fallbackStore?: IResourceStore<ArrayBuffer>, configurationFilename?: string) {
    super(info, resources, fallbackStore, configurationFilename);
  }

  get allowHighResolutionSprites(): boolean {
    return true;
  }

  #hitSoundRegex = /((?:soft|normal|drum)-((?:hitnormal|hitwhistle|hitfinish|hitclap|sliderslide|sliderwhistle)\d*))(?:\.wav|\.ogg|\.mp3)$/i;

  #shouldLoadSample(filename: string): boolean {
    if (filename.startsWith('combobreak'))
      return true;

    return this.#hitSoundRegex.test(filename);
  }

  async load() {
    await super.load();
    await Promise.all([
      await this.samples?.loadAvailable(this.#shouldLoadSample.bind(this)),
      this.loadTexture('hitcircle'),
      this.loadTexture('hitcircleoverlay'),
      this.loadTexture('approachcircle'),
      this.loadTexture('sliderfollowcircle'),
      this.loadTexture('sliderscorepoint'),
      this.loadTexture('sliderstartcircle'),
      this.loadTexture('sliderstartcircleoverlay'),
      this.loadTexture('sliderendcircle'),
      this.loadTexture('sliderendcircleoverlay'),
      this.loadTexture('reversearrow'),
      this.loadTexture('sliderb-spec'),
      this.loadTexture('hitcircleselect'),
      this.loadAnimation('followpoint', true),
      this.loadAnimation('sliderb', true),
      this.loadTexture('spinner-approachcircle'),
      this.loadTexture('spinner-background'),
      this.loadTexture('spinner-bottom'),
      this.loadTexture('spinner-glow'),
      this.loadTexture('spinner-middle'),
      this.loadTexture('spinner-middle2'),
      this.loadTexture('spinner-top'),
      this.loadTexture('cursor'),
      this.loadTexture('cursortrail'),
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
      this.loadAnimation('hit0', true),
      this.loadAnimation('hit50', true),
      this.loadAnimation('hit100', true),
      this.loadAnimation('hit300', true),
      ...this.store.getAvailableResources().filter(it => it.endsWith('.wav')).map(it => this.store.getAsync(it)),
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
}
