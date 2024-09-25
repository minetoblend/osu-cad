import type { Drawable } from 'osucad-framework';
import { resolved } from 'osucad-framework';
import { OsucadConfigManager } from '../../config/OsucadConfigManager';
import { OsucadSettings } from '../../config/OsucadSettings';
import { OsucadSpriteText } from '../../OsucadSpriteText';
import { PreferencesPanel } from './PreferencesPanel';
import { VolumeSliderContainer } from './VolumeSlider';
import { PreferencesToggle } from './PreferencesToggle';

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
        'Master',
        this.config.getBindable(OsucadSettings.MasterVolume)!,
        0,
        100,
        value => `${Math.round(value)}%`,
      ),
      new VolumeSliderContainer(
        'Music',
        this.config.getBindable(OsucadSettings.MusicVolume)!,
        0,
        100,
        value => `${Math.round(value)}%`,
      ),
      new VolumeSliderContainer(
        'Hitsounds',
        this.config.getBindable(OsucadSettings.HitsoundVolume)!,
        0,
        100,
        value => `${Math.round(value)}%`,
      ),
      new VolumeSliderContainer(
        'User interface',
        this.config.getBindable(OsucadSettings.UIVolume)!,
        0,
        100,
        value => `${Math.round(value)}%`,
      ),
      new VolumeSliderContainer(
        'Audio offset',
        this.config.getBindable(OsucadSettings.AudioOffset)!,
        -250,
        250,
        value => `${Math.round(value)}ms`,
      ),
      new VolumeSliderContainer(
        'Hitsound offset',
        this.config.getBindable(OsucadSettings.HitSoundOffset)!,
        -250,
        250,
        value => `${Math.round(value)}ms`,
      ),
      new PreferencesToggle('Use Audio Streaming', this.config.getBindable(OsucadSettings.UseAudioStreaming)!),
    ];
  }
}
