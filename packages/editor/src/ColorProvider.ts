import { Color } from "pixi.js";

export enum ColorScheme
{
  Red = 0,
  Orange = 45,
  Lime = 90,
  Green = 125,
  Aquamarine = 160,
  Blue = 200,
  Indigo = 240,
  Purple = 255,
  Plum = 320,
  Pink = 333,
}

export class ColorProvider
{
  public constructor(public hue: number | ColorScheme)
  {
  }

  public get background1()
  {
    return this.getColor(0.05, 0.4);
  }

  public get background2()
  {
    return this.getColor(0.05, 0.3);
  }

  public get background3()
  {
    return this.getColor(0.05, 0.25);
  }

  public get background4()
  {
    return this.getColor(0.05, 0.2);
  }

  public get background5()
  {
    return this.getColor(0.05, 0.15);
  }

  public get background6()
  {
    return this.getColor(0.1, 0.1);
  }


  /**
   * @param saturation 0~1
   * @param lightness 0~1
   */
  public getColor(
    saturation: number,
    lightness: number,
  )
  {
    return new Color({
      h: this.hue,
      s: saturation * 100,
      l: lightness * 100,
    });
  }
}
