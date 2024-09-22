import { ConfigManager } from './ConfigManager.ts';
import { OsucadSettings } from './OsucadSettings.ts';

export class OsucadConfigManager extends ConfigManager<OsucadSettings<any>> {
  initializeDefaults() {
    this.setDefault(OsucadSettings.Skin, 'default');
    this.setDefault(OsucadSettings.MasterVolume, 50);
    this.setDefault(OsucadSettings.MusicVolume, 75);
    this.setDefault(OsucadSettings.HitsoundVolume, 75);
    this.setDefault(OsucadSettings.UIVolume, 50);
    this.setDefault(OsucadSettings.AudioOffset, 0);
    this.setDefault(OsucadSettings.HitSoundOffset, 0);

    this.setDefault(OsucadSettings.HitAnimations, false);
    this.setDefault(OsucadSettings.FollowPoints, true);
    this.setDefault(OsucadSettings.SampleSetExpanded, false);
    this.setDefault(OsucadSettings.AnimatedSeek, true);
    this.setDefault(OsucadSettings.CompactTimeline, false);
    this.setDefault(OsucadSettings.NativeCursor, false);

    this.setDefault(OsucadSettings.SongSelectParallax, true);
    this.setDefault(OsucadSettings.SongSelectPreventLoadOnScroll, false);
    this.setDefault(OsucadSettings.SongSelectBackgroundBlur, true);
  }

  constructor() {
    super();

    this.initializeDefaults();
    this.load();
  }

  protected performLoad(): void {
    const config = localStorage.getItem('osucad-configuration');
    if (config) {
      try {
        const configObject = JSON.parse(config);

        for (const [key, value] of Object.entries(configObject)) {
          const lookup = OsucadSettings[key as keyof typeof OsucadSettings];

          if (!lookup) {
            console.warn(`Unknown config key: ${key}`);
            continue;
          }

          const bindable = this.getOriginalBindable(lookup);
          if (!bindable) {
            console.warn(`Unknown config key: ${key}`);
            continue;
          }

          bindable.value = value;
        }
      }
      catch (e) {
        console.error(e);
      }
    }
  }

  protected performSave(): void {
    const config = {} as any;

    for (const [key, value] of this.configStore.entries()) {
      config[key.name] = value.value;
    }

    localStorage.setItem(
      'osucad-configuration',
      JSON.stringify(config),
    );
  }
}
