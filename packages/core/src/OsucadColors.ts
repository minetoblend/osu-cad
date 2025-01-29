import type { ColorSource } from 'pixi.js';
import { Color } from 'pixi.js';

function color(color: ColorSource) {
  return new Color(color).toNumber();
}

export class OsucadColors {
  static readonly primary = color('#52CCA3');
  static readonly primaryHighlight = color('#65E6BA');
  static readonly text = color('#CBCBD6');
  static readonly translucent = color('#222228');
  static readonly selection = color('#FFA320');
  static readonly danger = color('#EB4034');

  static readonly white = color('#FFFFFF');
  static readonly black = color('#000000');
  static readonly red = color('#EB4034');
  static readonly green = color('#52CCA3');
  static readonly blue = color('#3B6DF7');
  static readonly yellow = color('#FFBC20');
  static readonly yellowDark = color('#966A03');
  static readonly yellowDarker = color('#664905');
  static readonly purple = color('#653BDB');
  static readonly purpleDark = color('#2A1073');
}
