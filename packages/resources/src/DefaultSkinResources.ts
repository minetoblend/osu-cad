import { LazyTexture } from "./LazyTexture";

import texture from './assets/textures/defaultSkin.webp'
import { Spritesheet } from "pixi.js";

import spriteSheetMeta from './assets/textures/defaultSkin.webp.json'

import combobreak from './assets/samples/defaultSkin/combobreak.wav'
import drumHitClap from './assets/samples/defaultSkin/drum-hitclap.wav'
import drumHitFinish from './assets/samples/defaultSkin/drum-hitfinish.wav'
import drumHitNormal from './assets/samples/defaultSkin/drum-hitnormal.wav'
import drumHitWhistle from './assets/samples/defaultSkin/drum-hitwhistle.wav'
import drumSliderSlide from './assets/samples/defaultSkin/drum-sliderslide.wav'
import drumSliderTick from './assets/samples/defaultSkin/drum-slidertick.wav'
import drumSliderWhistle from './assets/samples/defaultSkin/drum-sliderwhistle.wav'
import normalHitClap from './assets/samples/defaultSkin/normal-hitclap.wav'
import normalHitFinish from './assets/samples/defaultSkin/normal-hitfinish.wav'
import normalHitNormal from './assets/samples/defaultSkin/normal-hitnormal.wav'
import normalHitWhistle from './assets/samples/defaultSkin/normal-hitwhistle.wav'
import normalSliderSlide from './assets/samples/defaultSkin/normal-sliderslide.wav'
import normalSliderTick from './assets/samples/defaultSkin/normal-slidertick.wav'
import normalSliderWhistle from './assets/samples/defaultSkin/normal-sliderwhistle.wav'
import softHitClap from './assets/samples/defaultSkin/soft-hitclap.wav'
import softHitFinish from './assets/samples/defaultSkin/soft-hitfinish.wav'
import softHitNormal from './assets/samples/defaultSkin/soft-hitnormal.wav'
import softHitWhistle from './assets/samples/defaultSkin/soft-hitwhistle.wav'
import softSliderSlide from './assets/samples/defaultSkin/soft-sliderslide.wav'
import softSliderTick from './assets/samples/defaultSkin/soft-slidertick.wav'
import softSliderWhistle from './assets/samples/defaultSkin/soft-sliderwhistle.wav'
import spinnerBonus from './assets/samples/defaultSkin/spinnerbonus.wav'
import spinnerSpin from './assets/samples/defaultSkin/spinnerspin.wav'

export class DefaultSkinResources {
  static readonly #texture = new LazyTexture(texture, { autoGenerateMipmaps: true })

  static #loadP?: Promise<any>;

  static #spriteSheet?: Spritesheet;

  static async #load() {
    const spriteSheet = this.#spriteSheet! = new Spritesheet((await this.#texture.load())!, spriteSheetMeta)
    await spriteSheet.parse()
    return spriteSheet
  }

  static async getSpriteSheet() {
    this.#loadP ??= this.#load()
    await this.#loadP

    return this.#spriteSheet!
  }

  static readonly samples = {
    combobreak,
    drumHitClap,
    drumHitFinish,
    drumHitNormal,
    drumHitWhistle,
    drumSliderSlide,
    drumSliderTick,
    drumSliderWhistle,
    normalHitClap,
    normalHitFinish,
    normalHitNormal,
    normalHitWhistle,
    normalSliderSlide,
    normalSliderTick,
    normalSliderWhistle,
    softHitClap,
    softHitFinish,
    softHitNormal,
    softHitWhistle,
    softSliderSlide,
    softSliderTick,
    softSliderWhistle,
    spinnerBonus,
    spinnerSpin,
  } satisfies Record<string, string>
}
