import type { Drawable } from '../drawables';
import type { MenuItem } from './MenuItem';
import { BasicScrollContainer, type ScrollContainer } from '../containers';
import { Anchor, Direction } from '../drawables';
import { SpriteText } from '../text';
import { DrawableMenuItem, Menu } from './Menu';

export class BasicMenu extends Menu {
  constructor(direction: Direction, topLevelMenu = false) {
    super(direction, topLevelMenu);

    this.backgroundColor = 'rgb(40, 65, 82)';
  }

  protected override createSubmenu(): Menu {
    return new BasicMenu(Direction.Vertical).with({
      anchor: this.direction === Direction.Horizontal ? Anchor.BottomLeft : Anchor.TopRight,
    });
  }

  protected override createDrawableMenuItem(item: MenuItem): DrawableMenuItem {
    return new BasicDrawableMenuItem(item);
  }

  protected override createScrollContainer(direction: Direction): ScrollContainer {
    return new BasicScrollContainer(direction);
  }
}

class BasicDrawableMenuItem extends DrawableMenuItem {
  constructor(item: MenuItem) {
    super(item);

    this.backgroundColor = 'rgb(51, 88, 96)';
    this.backgroundColorHover = 'rgb(61, 98, 106)';
  }

  override createContent(): Drawable {
    return new SpriteText({
      anchor: Anchor.CenterLeft,
      origin: Anchor.CenterLeft,
    });
  }
}
