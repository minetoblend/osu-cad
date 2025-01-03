import type { DrawableMenuItem, ReadonlyDependencyContainer, Vec2 } from 'osucad-framework';
import { Anchor, Direction, MenuItem, resolved } from 'osucad-framework';
import { OsucadColors } from '../../../../OsucadColors';
import { ToggleMenuItem } from '../../../../userInterface/ToggleMenuItem';
import { EditorMenu } from '../../../header/EditorMenu';
import { DrawableEditorMenubarItem } from '../../../header/EditorMenuBar';
import { SnapSettings } from '../SnapSettings';

export class ModdingToolMenu extends EditorMenu {
  constructor(items: MenuItem[]) {
    super(Direction.Horizontal, true);

    this.anchor = Anchor.CenterLeft;
    this.origin = Anchor.CenterLeft;

    this.backgroundColor = OsucadColors.translucent;
  }

  @resolved(SnapSettings)
  snapSettings!: SnapSettings;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.items = [
      new MenuItem({
        text: 'Snapping',
        items: [
          new ToggleMenuItem({
            text: 'Object centers',
            active: this.snapSettings.snapToObjectCenters,
          }),
          new ToggleMenuItem({
            text: 'Circle borders',
            active: this.snapSettings.snapToCircleBorders,
          }),
          new ToggleMenuItem({
            text: 'Visual spacing',
            active: this.snapSettings.snapToVisualSpacing,
          }),
          new ToggleMenuItem({
            text: 'Slider path points',
            active: this.snapSettings.snapToSliderPath,
          }),
        ],
      }),
    ];
  }

  protected override updateSize(newSize: Vec2) {
    this.size = newSize;
  }

  protected override createDrawableMenuItem(item: MenuItem): DrawableMenuItem {
    return new DrawableEditorMenubarItem(item);
  }
}
