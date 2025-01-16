import { loadTexture } from "@osucad/framework";
import { Spritesheet, Texture } from 'pixi.js'

import textureUrl from './assets/textures/icons.webp'
import manifest from './assets/textures/icons.webp.json'

export type IconName = string & keyof typeof manifest.frames

export class OsucadIcons {
  static #spritesheet: Spritesheet | undefined = undefined

  static get spritesheet(): Spritesheet {
    return this.#spritesheet!
  }

  static async load() {
    const texture = await loadTexture(textureUrl)
    if (!texture)
      throw new Error('Could not load icons texture')

    const spritesheet = new Spritesheet(texture, manifest)

    await spritesheet.parse()

    this.#spritesheet = spritesheet
  }

  static get(name: IconName): Texture {
    return this.spritesheet.textures[name]
  }
}

export function getIcon(name: IconName): Texture {
  return OsucadIcons.get(name)
}
