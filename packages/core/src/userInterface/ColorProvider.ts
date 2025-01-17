import type { ColorSource } from 'pixi.js';

export class ColorProvider {
  constructor(
    readonly background1: ColorSource = 0x17171B,
  ) {}
}
