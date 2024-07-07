import { Axes, Drawable, RoundedBox } from 'osucad-framework';
import { PreferencesPanel } from './PreferencesPanel';

export class AudioPreferences extends PreferencesPanel {
  getTitle(): string {
    return 'Audio';
  }

  createContent(): Drawable[] {
    return Array.from(
      { length: 10 },
      () =>
        new RoundedBox({
          relativeSizeAxes: Axes.X,
          height: 25,
          width: 0.5 + Math.random() * 0.5,
          cornerRadius: 4,
          alpha: 0.2,
        }),
    );
  }
}
