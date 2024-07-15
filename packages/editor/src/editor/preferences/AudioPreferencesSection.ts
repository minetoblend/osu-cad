import { Axes, Drawable, resolved, RoundedBox } from 'osucad-framework';
import { PreferencesPanel } from './PreferencesPanel';
import { PreferencesStore } from '../../preferences/PreferencesStore';
import { VolumeSlider, VolumeSliderContainer } from './VolumeSlider';

export class AudioPreferencesSection extends PreferencesPanel {
  getTitle(): string {
    return 'Audio';
  }

  @resolved(PreferencesStore)
  preferences!: PreferencesStore;

  createContent(): Drawable[] {
    return [
      new VolumeSliderContainer(
        'master',
        this.preferences.audio.masterVolumeBindable,
      ),
      new VolumeSliderContainer(
        'music',
        this.preferences.audio.musicVolumeBindable,
      ),
      new VolumeSliderContainer(
        'hitsounds',
        this.preferences.audio.hitsoundVolumeBindable,
      ),
      new VolumeSliderContainer('ui', this.preferences.audio.uiVolumeBindable),
    ];
  }
}
