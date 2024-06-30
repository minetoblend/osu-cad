import { FontDefinition } from 'osucad-framework';

export class UIFonts {
  readonly nunitoSans = new FontDefinition(
    '/assets/fonts/nunito-sans-latin-400-normal.fnt',
    '/assets/fonts/nunito-sans-400.png',
  );
  readonly nunitoSans500 = new FontDefinition(
    '/assets/fonts/nunito-sans-latin-500-normal.fnt',
    '/assets/fonts/nunito-sans-500.png',
  );
  readonly nunitoSans600 = new FontDefinition(
    '/assets/fonts/nunito-sans-latin-600-normal.fnt',
    '/assets/fonts/nunito-sans-600.png',
  );
  readonly nunitoSans700 = new FontDefinition(
    '/assets/fonts/nunito-sans-latin-700-normal.fnt',
    '/assets/fonts/nunito-sans-700.png',
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
