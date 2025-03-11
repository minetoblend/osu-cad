import { FontDefinition } from '@osucad/framework';

import './fonts/nunito-sans-400.css';
import './fonts/nunito-sans-500.css';
import './fonts/nunito-sans-600.css';
import './fonts/nunito-sans-700.css';

export class UIFonts {
  static nunitoSans400 = new FontDefinition({
    fontFamily: 'Nunito Sans Regular',
    fontWeight: '400',
  });

  static nunitoSans500 = new FontDefinition({
    fontFamily: 'Nunito Sans Medium',
    fontWeight: '500',
  });

  static nunitoSans600 = new FontDefinition({
    fontFamily: 'Nunito Sans Semibold',
    fontWeight: '600',
  });

  static nunitoSans700 = new FontDefinition({
    fontFamily: 'Nunito Sans Bold',
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
