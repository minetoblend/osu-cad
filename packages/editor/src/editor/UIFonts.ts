import { FontDefinition } from 'osucad-framework';

export class UIFonts {
  static readonly nunitoSans = new FontDefinition(
    '/assets/fonts/nunito-sans-latin-400-normal.fnt',
    '/assets/fonts/nunito-sans-400.png',
  );
  static readonly nunitoSans500 = new FontDefinition(
    '/assets/fonts/nunito-sans-latin-500-normal.fnt',
    '/assets/fonts/nunito-sans-500.png',
  );
  static readonly nunitoSans600 = new FontDefinition(
    '/assets/fonts/nunito-sans-latin-600-normal.fnt',
    '/assets/fonts/nunito-sans-600.png',
  );
  static readonly nunitoSans700 = new FontDefinition(
    '/assets/fonts/nunito-sans-latin-700-normal.fnt',
    '/assets/fonts/nunito-sans-700.png',
  );

  private static loadPromise: Promise<void> | undefined = undefined;

  static async load(): Promise<void> {
    if (this.loadPromise) return this.loadPromise;
    this.loadPromise = Promise.all([
      this.nunitoSans.load(),
      this.nunitoSans500.load(),
      this.nunitoSans600.load(),
      this.nunitoSans700.load(),
    ]).then(() => void 0);

    return this.loadPromise;
  }
}
