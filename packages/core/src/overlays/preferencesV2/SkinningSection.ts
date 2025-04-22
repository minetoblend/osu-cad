import type { ReadonlyDependencyContainer } from '@osucad/framework';
import { Axes, Bindable, BindableBoolean, Container, Dimension, GridContainer, GridSizeMode } from '@osucad/framework';
import { getIcon } from '@osucad/resources';
import { OsucadConfigManager } from '../../config/OsucadConfigManager';
import { OsucadSettings } from '../../config/OsucadSettings';
import { OsucadSpriteText } from '../../drawables/OsucadSpriteText';
import { DropdownItem, DropdownSelect } from '../../userInterface/DropdownSelect';
import { PreferencesSection } from './PreferencesSection';
import { SettingsCheckbox } from './SettingsCheckbox';

export class SkinningSection extends PreferencesSection {
  constructor() {
    super('Skinning', getIcon('circle'));
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const config = dependencies.resolve(OsucadConfigManager);

    config.bindWith(OsucadSettings.Skin, this.skin);
    config.bindWith(OsucadSettings.UseSkinHitSounds, this.useSkinHitsounds);
    config.bindWith(OsucadSettings.UseBeatmapSkins, this.useBeatmapSkins);
    config.bindWith(OsucadSettings.BeatmapHitSounds, this.beatmapHitsounds);
    config.bindWith(OsucadSettings.BeatmapComboColors, this.beatmapComboColors);

    if (this.skin.value !== 'argon')
      this.skin.value = 'stable';

    this.addRange([
      new GridContainer({
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        columnDimensions: [
          new Dimension(GridSizeMode.Absolute, 100),
          new Dimension(),
        ],
        rowDimensions: [
          new Dimension(GridSizeMode.AutoSize),
        ],
        content: [
          [
            new Container({
              autoSizeAxes: Axes.Both,
              padding: { vertical: 5 },
              child: new OsucadSpriteText({
                text: 'Active skin',
              }),
            }),
            new DropdownSelect({
              items: [
                new DropdownItem('Classic skin', 'stable'),
                new DropdownItem('Argon', 'argon'),
              ],
              current: this.skin as any,
            }),
          ],
        ],
      }),
      new SettingsCheckbox('Use skin hitsounds', this.useSkinHitsounds),
      new SettingsCheckbox('Use beatmap skins', this.useBeatmapSkins),
      new SettingsCheckbox('Use beatmap hitsounds', this.beatmapHitsounds),
      new SettingsCheckbox('Use beatmap combo colors', this.beatmapComboColors),
    ]);
  }

  readonly skin = new Bindable('stable');
  readonly useBeatmapSkins = new BindableBoolean();
  readonly useSkinHitsounds = new BindableBoolean();
  readonly beatmapHitsounds = new BindableBoolean();
  readonly beatmapComboColors = new BindableBoolean();
}
