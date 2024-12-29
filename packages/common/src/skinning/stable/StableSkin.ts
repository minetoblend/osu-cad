import type { IResourceStore } from 'osucad-framework';
import type { Color, Texture } from 'pixi.js';
import type { IHasComboInformation } from '../../hitObjects/IHasComboInformation';
import type { IResourcesProvider } from '../../io/IResourcesProvider';
import type { IHasComboColors } from '../IHasComboColors';
import type { SkinConfigurationLookup } from '../SkinConfigurationLookup';
import type { SkinInfo } from '../SkinInfo';
import { Skin } from '../Skin';
import { SkinComboColorLookup } from '../SkinComboColorLookup';

export class StableSkin extends Skin {
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

  override async load() {
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

  canLoadTexture(componentName: string) {
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

  async loadTexture(componentName: string) {
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

  override getConfig<T>(lookup: SkinConfigurationLookup<T>): T | null;

  override getConfig<T>(lookup: SkinConfigurationLookup<any>): any | null {
    if (lookup instanceof SkinComboColorLookup) {
      return this.getComboColor(this.configuration, lookup.colorIndex, lookup.combo);
    }

    return super.getConfig(lookup);
  }

  getComboColor(source: IHasComboColors, colorIndex: number, combo: IHasComboInformation): Color | null {
    const color = source.comboColors?.[colorIndex % source.comboColors.length];
    return color ?? null;
  }
}
