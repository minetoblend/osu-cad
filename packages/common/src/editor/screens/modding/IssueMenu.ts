import type { DrawableMenuItem, MenuItem } from 'osucad-framework';
import { Direction } from 'osucad-framework';
import { OsucadColors } from '../../../OsucadColors';
import { EditorMenu } from '../../header/EditorMenu';
import { DrawableEditorMenubarItem } from '../../header/EditorMenuBar';

export class IssueMenu extends EditorMenu {
  constructor(items: MenuItem[]) {
    super(Direction.Horizontal, true);

    this.backgroundColor = OsucadColors.translucent;

    this.items = items;
  }

  protected override createDrawableMenuItem(item: MenuItem): DrawableMenuItem {
    return new DrawableEditorMenubarItem(item);
  }
}
