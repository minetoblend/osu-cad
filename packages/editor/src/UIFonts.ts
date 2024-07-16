import { FontDefinition } from 'osucad-framework';

import nunitoSans400 from './assets/fonts/nunito-sans-400.fnt?url';
import nunitoSans400Texture from './assets/fonts/nunito-sans-400.png';
import nunitoSans500 from './assets/fonts/nunito-sans-500.fnt?url';
import nunitoSans500Texture from './assets/fonts/nunito-sans-500.png';
import nunitoSans600 from './assets/fonts/nunito-sans-600.fnt?url';
import nunitoSans600Texture from './assets/fonts/nunito-sans-600.png';
import nunitoSans700 from './assets/fonts/nunito-sans-700.fnt?url';
import nunitoSans700Texture from './assets/fonts/nunito-sans-700.png';

export class UIFonts {
  static nunitoSans400 = new FontDefinition(
    nunitoSans400,
    nunitoSans400Texture,
  );

  static nunitoSans500 = new FontDefinition(
    nunitoSans500,
    nunitoSans500Texture,
  );

  static nunitoSans600 = new FontDefinition(
    nunitoSans600,
    nunitoSans600Texture,
  );

  static nunitoSans700 = new FontDefinition(
    nunitoSans700,
    nunitoSans700Texture,
  );

  static load() {
    return Promise.all([
      this.nunitoSans400.load(),
      this.nunitoSans500.load(),
      this.nunitoSans600.load(),
      this.nunitoSans700.load(),
    ]);
  }
}
