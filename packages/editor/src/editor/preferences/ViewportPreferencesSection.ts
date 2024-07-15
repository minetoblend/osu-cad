import { type Drawable, resolved } from 'osucad-framework';
import { PreferencesStore } from '../../preferences/PreferencesStore';
import { PreferencesPanel } from './PreferencesPanel';
import { PreferencesToggle } from './PreferencesToggle';

export class ViewportPreferencesSection extends PreferencesPanel {
  getTitle(): string {
    return 'Viewport';
  }

  @resolved(PreferencesStore)
  preferences!: PreferencesStore;

  createContent(): Drawable[] {
    return [
      new PreferencesToggle(
        'Hit animations',
        this.preferences.viewport.hitAnimationsBindable,
      ),
    ];
  }
}
