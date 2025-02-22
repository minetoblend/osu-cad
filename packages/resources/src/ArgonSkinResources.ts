import { LazyTexture } from "./LazyTexture";

import texture from './assets/textures/argon.webp'
import { Spritesheet } from "pixi.js";

import spriteSheetMeta from './assets/textures/argon.webp.json'

import combobreak from "./assets/samples/argon/combobreak.wav";
import drumHitClap from "./assets/samples/argon/drum-hitclap.wav";
import drumHitFinish from "./assets/samples/argon/drum-hitfinish.wav";
import drumHitNormal from "./assets/samples/argon/drum-hitnormal.wav";
import drumHitWhistle from "./assets/samples/argon/drum-hitwhistle.wav";
import drumSliderSlide from "./assets/samples/argon/drum-sliderslide.wav";
import drumSliderTick from "./assets/samples/argon/drum-slidertick.wav";
import normalHitClap from "./assets/samples/argon/normal-hitclap.wav";
import normalHitFinish from "./assets/samples/argon/normal-hitfinish.wav";
import normalHitNormal from "./assets/samples/argon/normal-hitnormal.wav";
import normalHitWhistle from "./assets/samples/argon/normal-hitwhistle.wav";
import normalSliderSlide from "./assets/samples/argon/normal-sliderslide.wav";
import normalSliderTick from "./assets/samples/argon/normal-slidertick.wav";
import normalSliderWhistle from "./assets/samples/argon/normal-sliderwhistle.wav";
import softHitClap from "./assets/samples/argon/soft-hitclap.wav";
import softHitFinish from "./assets/samples/argon/soft-hitfinish.wav";
import softHitNormal from "./assets/samples/argon/soft-hitnormal.wav";
import softHitWhistle from "./assets/samples/argon/soft-hitwhistle.wav";
import softSliderSlide from "./assets/samples/argon/soft-sliderslide.wav";
import softSliderTick from "./assets/samples/argon/soft-slidertick.wav";
import softSliderWhistle from "./assets/samples/argon/soft-sliderwhistle.wav";
import spinnerBonus from "./assets/samples/argon/spinnerbonus.wav";
import spinnerSpin from "./assets/samples/argon/spinnerspin.wav";


export class ArgonSkinResources {
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
    'combobreak.wav': combobreak,
    'drum-hitclap.wav': drumHitClap,
    'drum-hitfinish.wav': drumHitFinish,
    'drum-hitnormal.wav': drumHitNormal,
    'drum-hitwhistle.wav': drumHitWhistle,
    'drum-sliderslide.wav': drumSliderSlide,
    'drum-slidertick.wav': drumSliderTick,
    'normal-hitclap.wav': normalHitClap,
    'normal-hitfinish.wav': normalHitFinish,
    'normal-hitnormal.wav': normalHitNormal,
    'normal-hitwhistle.wav': normalHitWhistle,
    'normal-sliderslide.wav': normalSliderSlide,
    'normal-slidertick.wav': normalSliderTick,
    'normal-sliderwhistle.wav': normalSliderWhistle,
    'soft-hitclap.wav': softHitClap,
    'soft-hitfinish.wav': softHitFinish,
    'soft-hitnormal.wav': softHitNormal,
    'soft-hitwhistle.wav': softHitWhistle,
    'soft-sliderslide.wav': softSliderSlide,
    'soft-slidertick.wav': softSliderTick,
    'soft-sliderwhistle.wav': softSliderWhistle,
    'spinnerbonus.wav': spinnerBonus,
    'spinnerspin.wav': spinnerSpin,
  } satisfies Record<string, string>
}
