import type { TextStyleOptions } from "pixi.js";
import { TextStyle } from "pixi.js";

export class FontDefinition
{
  public constructor(style: TextStyleOptions)
  {
    this.style = new TextStyle(style);
  }

  public readonly style: TextStyle;

  public async load()
  {
    await document.fonts.load(`${this.style.fontWeight} 100px ${this.style.fontFamily}`);
  }
}
