import {
  FontDefinition,
  SpriteText,
  SpriteTextOptions,
} from 'osucad-framework';

import nunitoSans400 from './assets/fonts/nunito-sans-400.fnt?bmFont';
import nunitoSans500 from './assets/fonts/nunito-sans-500.fnt?bmFont';
import nunitoSans600 from './assets/fonts/nunito-sans-600.fnt?bmFont';
import nunitoSans700 from './assets/fonts/nunito-sans-700.fnt?bmFont';

export type OsucadSpriteTextOptions = Omit<
  SpriteTextOptions,
  'font' | 'style'
> & {
  fontWeight?: 400 | 500 | 600 | 700;
  fontSize?: number;
};

export class OsucadSpriteText extends SpriteText {
  constructor(options: OsucadSpriteTextOptions = {}) {
    const { fontWeight = 400, fontSize = 16, ...rest } = options;

    let font: FontDefinition;

    switch (fontWeight) {
      case 500:
        font = nunitoSans500;
        break;
      case 600:
        font = nunitoSans600;
        break;
      case 700:
        font = nunitoSans700;
        break;
      default:
        font = nunitoSans400;
        break;
    }

    super({
      ...rest,
      font,
      style: {
        fill: 0xffffff,
        fontSize,
      },
    });
  }
}
