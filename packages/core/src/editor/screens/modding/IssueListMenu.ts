import type { DrawableMenuItem, ReadonlyDependencyContainer } from '@osucad/framework';
import { Direction, MenuItem } from '@osucad/framework';
import { BackdropBlurFilter } from 'pixi-filters';
import { ModdingConfigManager } from '../../../config/ModdingConfigManager';
import { ModdingSettings } from '../../../config/ModdingSettings';
import { OsucadColors } from '../../../OsucadColors';
import { ToggleMenuItem } from '../../../userInterface/ToggleMenuItem';
import { EditorMenu } from '../../header/EditorMenu';
import { DrawableEditorMenubarItem } from '../../header/EditorMenuBar';

export class IssueListMenu extends EditorMenu {
  constructor() {
    super(Direction.Horizontal, true);

    this.backgroundColor = OsucadColors.translucent;
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const config = dependencies.resolve(ModdingConfigManager);

    this.items = [
      new MenuItem({
        text: 'Settings',
        items: [
          new ToggleMenuItem({
            text: 'Show minor issues',
            active: config.getBindable(ModdingSettings.ShowMinorIssues)!,
          }),
        ],
      }),
    ];

    const filter = new BackdropBlurFilter({
      strength: 15,
      quality: 3,
      resolution: 'inherit',
      antialias: 'inherit',
    });
    filter.padding = 15;

    this.filters = [filter];
  }

  protected override createDrawableMenuItem(item: MenuItem): DrawableMenuItem {
    return new DrawableEditorMenubarItem(item);
  }
}
