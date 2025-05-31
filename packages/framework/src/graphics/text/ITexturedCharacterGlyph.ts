import type { Texture } from "pixi.js";

export interface ICharacterGlyph
{
  readonly xOffset: number
  readonly yOffset: number
  readonly xAdvance: number
  readonly baseline: number
  readonly character: string

  getKerning(last: ICharacterGlyph): number
}

export interface ITexturedCharacterGlyph extends ICharacterGlyph
{
  readonly texture: Texture
  readonly width: number
  readonly height: number
}

export function isWhiteSpace(glyph: ICharacterGlyph)
{
  // TODO
  return glyph.character === " ";
}
