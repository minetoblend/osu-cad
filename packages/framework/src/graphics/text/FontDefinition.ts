import type { TextStyleOptions } from "pixi.js";
import { TextStyle } from "pixi.js";

export class FontDefinition 
{
  constructor(style: TextStyleOptions) 
  {
    this.style = new TextStyle(style);
  }

  readonly style: TextStyle;

  async load() 
  {
    await document.fonts.load(`${this.style.fontWeight} 100px ${this.style.fontFamily}`);
  }
}
