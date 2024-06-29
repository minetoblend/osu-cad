import { FontDefinition } from 'osucad-framework';

export class UIFonts {
  readonly nunitoSans = new FontDefinition(
    new URL('../assets/fonts/nunito-sans-400.fnt', import.meta.url).href,
    new URL('../assets/fonts/nunito-sans-400.png', import.meta.url).href,
  );
  readonly nunitoSans500 = new FontDefinition(
    new URL('../assets/fonts/nunito-sans-500.fnt', import.meta.url).href,
    new URL('../assets/fonts/nunito-sans-500.png', import.meta.url).href,
  );
  readonly nunitoSans600 = new FontDefinition(
    new URL('../assets/fonts/nunito-sans-600.fnt', import.meta.url).href,
    new URL('../assets/fonts/nunito-sans-600.png', import.meta.url).href,
  );
  readonly nunitoSans700 = new FontDefinition(
    new URL('../assets/fonts/nunito-sans-700.fnt', import.meta.url).href,
    new URL('../assets/fonts/nunito-sans-700.png', import.meta.url).href,
  );

  async load(): Promise<void> {
    await Promise.all([
      this.nunitoSans.load(),
      this.nunitoSans500.load(),
      this.nunitoSans600.load(),
      this.nunitoSans700.load(),
    ]);
  }
}
