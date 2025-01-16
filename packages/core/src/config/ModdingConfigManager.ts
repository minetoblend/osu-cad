import { ConfigManager } from './ConfigManager';
import { ModdingSettings } from './ModdingSettings';

export class ModdingConfigManager extends ConfigManager<ModdingSettings<any>> {
  initializeDefaults() {
    this.setDefault(ModdingSettings.ShowMinorIssues, false);
  }

  constructor() {
    super();

    this.initializeDefaults();
    this.load();
  }

  protected performLoad(): void {
    const config = localStorage.getItem('osucad-modding-configuration');
    if (config) {
      try {
        const configObject = JSON.parse(config);

        for (const [key, value] of Object.entries(configObject)) {
          const lookup = ModdingSettings[key as keyof typeof ModdingSettings];

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
      'osucad-modding-configuration',
      JSON.stringify(config),
    );
  }
}
