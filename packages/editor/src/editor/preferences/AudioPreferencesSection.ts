import type { Drawable } from 'osucad-framework';
import { resolved } from 'osucad-framework';
import { PreferencesStore } from '../../preferences/PreferencesStore';
import { OsucadSpriteText } from '../../OsucadSpriteText';
import { PreferencesPanel } from './PreferencesPanel';
import { VolumeSliderContainer } from './VolumeSlider';
import { PreferencesToggle } from './PreferencesToggle';
import { OsucadConfigManager } from '../../config/OsucadConfigManager.ts';
import { OsucadSettings } from '../../config/OsucadSettings.ts';

export class AudioPreferencesSection extends PreferencesPanel {
  getTitle(): string {
    return 'Audio';
  }

  @resolved(OsucadConfigManager)
  config!: OsucadConfigManager;

  createContent(): Drawable[] {
    return [
      new OsucadSpriteText({
        text: 'Volume',
        fontSize: 16,
        color: 0xB6B6C3,
      }),
      new VolumeSliderContainer(
        'master',
        this.config.getBindable(OsucadSettings.MasterVolume)!,
        0,
        100,
        value => `${Math.round(value)}%`,
      ),
      new VolumeSliderContainer(
        'music',
        this.config.getBindable(OsucadSettings.MusicVolume)!,
        0,
        100,
        value => `${Math.round(value)}%`,
      ),
      new VolumeSliderContainer(
        'hitsounds',
        this.config.getBindable(OsucadSettings.HitsoundVolume)!,
        0,
        100,
        value => `${Math.round(value)}%`,
      ),
      new VolumeSliderContainer(
        'user interface',
        this.config.getBindable(OsucadSettings.UIVolume)!,
        0,
        100,
        value => `${Math.round(value)}%`,
      ),
      new VolumeSliderContainer(
        'audio offset',
        this.config.getBindable(OsucadSettings.AudioOffset)!,
        -250,
        250,
        value => `${Math.round(value)}ms`,
      ),
    ];
  }
}
