import {
  CompositeDrawable,
  FontDefinition,
  SpriteText,
  SpriteTextOptions,
} from 'osucad-framework';
import { UIFonts } from './editor/UIFonts';

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
        font = UIFonts.nunitoSans500;
        break;
      case 600:
        font = UIFonts.nunitoSans600;
        break;
      case 700:
        font = UIFonts.nunitoSans700;
        break;
      default:
        font = UIFonts.nunitoSans;
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
