import type { Drawable } from 'osucad-framework';
import type { LoadableSkin } from '../../environment';
import { Axes, Bindable, dependencyLoader, FillDirection, FillFlowContainer, resolved } from 'osucad-framework';
import { OsucadConfigManager } from '../../config/OsucadConfigManager';
import { OsucadSettings } from '../../config/OsucadSettings';
import { SkinStore } from '../../environment';
import { SkinManager } from '../../skinning/SkinManager';
import { DropdownItem, DropdownSelect } from '../../userInterface/DropdownSelect';
import { ThemeColors } from '../ThemeColors';
import { PreferencesPanel } from './PreferencesPanel';
import { PreferencesToggle } from './PreferencesToggle';

export class SkinSection extends PreferencesPanel {
  getTitle(): string {
    return 'Skin';
  }

  @resolved(OsucadConfigManager)
  protected config!: OsucadConfigManager;

  createContent(): Drawable[] {
    return [
      new SkinSelect(),
      new PreferencesToggle('Use Skin Hitsounds', this.config.getBindable(OsucadSettings.UseSkinHitSounds)!),
      new PreferencesToggle('Use Beatmap Skins', this.config.getBindable(OsucadSettings.UseBeatmapSkins)!),
      new PreferencesToggle('Use Beatmap Hitsounds', this.config.getBindable(OsucadSettings.BeatmapHitSounds)!),
      new PreferencesToggle('Use Beatmap Combo Colors', this.config.getBindable(OsucadSettings.BeatmapComboColors)!),
    ];
  }
}

class SkinSelect extends FillFlowContainer {
  constructor() {
    super();
  }

  @resolved(ThemeColors)
  protected colors!: ThemeColors;

  @resolved(SkinStore)
  protected skinStore!: SkinStore;

  @resolved(OsucadConfigManager)
  protected config!: OsucadConfigManager;

  @dependencyLoader()
  load() {
    this.relativeSizeAxes = Axes.X;
    this.autoSizeAxes = Axes.Y;
    this.direction = FillDirection.Vertical;

    this.children = [
      this.#dropdown = new DropdownSelect<LoadableSkin | null>({
        items: [
          new DropdownItem<LoadableSkin | null>('Default skin', null),
        ],
      }),
    ];

    this.config.bindWith(OsucadSettings.Skin, this.activeSkinName);

    this.skins = this.skinStore.skins.getBoundCopy();

    this.skins.addOnChangeListener((e) => {
      this.#dropdown.items = [
        new DropdownItem<LoadableSkin | null>('Default skin', null),
        ...e.value.map(it => new DropdownItem<LoadableSkin | null>(it.name, it)),
      ];

      this.#dropdown.current.value = e.value === null
        ? null
        : e.value.find(it => it.name === this.activeSkinName.value) ?? null;
    }, { immediate: true });

    this.#dropdown.current.addOnChangeListener((e) => {
      if (e.value)
        this.skinManager.loadSkin(e.value);
      else
        this.skinManager.setActiveSkin(null);
      this.activeSkinName.value = e.value?.name ?? null;
    });
  }

  skins!: Bindable<LoadableSkin[]>;

  activeSkinName = new Bindable<string | null>(null);

  #dropdown!: DropdownSelect<LoadableSkin | null>;

  @resolved(SkinManager)
  skinManager!: SkinManager;
}
