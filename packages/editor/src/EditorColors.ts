import { Color, type ColorSource } from "pixi.js";

function color(color: ColorSource)
{
  return new Color(color).toNumber();
}

export namespace EditorColors
{
  export const primary = 0x63E2B7;

  export const white = color("#FFFFFF");
  export const black = color("#000000");
  export const red = color("#EB4034");
  export const green = color("#52CCA3");
  export const blue = color("#3B6DF7");
  export const yellow = color("#FFBC20");
  export const yellowDark = color("#966A03");
  export const yellowDarker = color("#664905");
  export const purple = color("#653BDB");
  export const purpleDark = color("#2A1073");
}
