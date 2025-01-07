import { LazyTexture } from "./LazyTexture";

import texture from './assets/defaultSkin.webp'
import { Spritesheet, SpritesheetData } from "pixi.js";

import spriteSheetMeta from './assets/defaultSkin.webp.json'

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
}
