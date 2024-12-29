import { FontDefinition } from 'osucad-framework';

import '@fontsource/nunito-sans/400.css';
import '@fontsource/nunito-sans/500.css';
import '@fontsource/nunito-sans/600.css';
import '@fontsource/nunito-sans/700.css';

export class UIFonts {
  static nunitoSans400 = new FontDefinition({
    fontFamily: 'Nunito Sans',
    fontWeight: '400',
  });

  static nunitoSans500 = new FontDefinition({
    fontFamily: 'Nunito Sans',
    fontWeight: '500',
  });

  static nunitoSans600 = new FontDefinition({
    fontFamily: 'Nunito Sans',
    fontWeight: '600',
  });

  static nunitoSans700 = new FontDefinition({
    fontFamily: 'Nunito Sans',
    fontWeight: '700',
  });

  static async load() {
    await Promise.all([
      this.nunitoSans400.load(),
      this.nunitoSans500.load(),
      this.nunitoSans600.load(),
      this.nunitoSans700.load(),
    ]);
  }
}
