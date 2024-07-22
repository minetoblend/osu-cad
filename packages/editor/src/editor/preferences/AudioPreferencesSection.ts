import type { Drawable } from 'osucad-framework';
import { resolved } from 'osucad-framework';
import { PreferencesStore } from '../../preferences/PreferencesStore';
import { OsucadSpriteText } from '../../OsucadSpriteText';
import { PreferencesPanel } from './PreferencesPanel';
import { VolumeSliderContainer } from './VolumeSlider';
import { PreferencesToggle } from './PreferencesToggle';

export class AudioPreferencesSection extends PreferencesPanel {
  getTitle(): string {
    return 'Audio';
  }

  @resolved(PreferencesStore)
  preferences!: PreferencesStore;

  createContent(): Drawable[] {
    return [
      new OsucadSpriteText({
        text: 'Volume',
        fontSize: 16,
        color: 0xB6B6C3,
      }),
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
      new VolumeSliderContainer(
        'user interface',
        this.preferences.audio.uiVolumeBindable,
      ),
      new VolumeSliderContainer(
        'audio offset',
        this.preferences.audio.audioOffsetBindable,
        -250,
        250,
        value => `${Math.round(value)}ms`,
      ),
      new PreferencesToggle(
        'Automatic offset detection',
        this.preferences.audio.automaticOffsetBindable,
      ),
    ];
  }
}
