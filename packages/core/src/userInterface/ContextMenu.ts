import type { Drawable, MenuItem, ReadonlyDependencyContainer, SpriteText, Vec2 } from '@osucad/framework';
import type { Graphics } from 'pixi.js';
import type { OsucadMenuItem } from './OsucadMenuItem';
import { Anchor, Axes, Container, Direction, DrawableMenuItem, FastRoundedBox, GraphicsDrawable, MarginPadding, Menu, ScrollbarContainer, ScrollContainer } from '@osucad/framework';
import { OsucadSpriteText } from '../drawables/OsucadSpriteText';
import { OsucadColors } from '../OsucadColors';
import { ContextMenuContainer } from './ContextMenuContainer';

export class ContextMenu extends Menu {
  constructor(topLevelMenu: boolean = false) {
    super(Direction.Vertical, topLevelMenu);
  }

  protected override createSubmenu(): Menu {
    return new ContextMenu();
  }

  protected override createDrawableMenuItem(item: MenuItem): DrawableMenuItem {
    return new DrawableContextMenuItem(item);
  }

  protected override updateSize(newSize: Vec2) {
    this.size = newSize;
    // this.resizeTo(newSize, 300, EasingFunction.OutExpo);
  }

  protected override createScrollContainer(direction: Direction): ScrollContainer {
    return new (class extends ScrollContainer {
      constructor(direction: Direction) {
        super(direction);
        this.clampExtension = 0;
      }

      protected createScrollbar(direction: Direction): ScrollbarContainer {
        return new (class extends ScrollbarContainer {
          resizeScrollbarTo(): void {
          }
        })(direction);
      }
    })(direction);
  }

  protected override createBackground(): Drawable {
    return new FastRoundedBox({
      relativeSizeAxes: Axes.Both,
      color: OsucadColors.translucent,
      cornerRadius: 4,
    });
  }

  protected override get openOnHover(): boolean {
    return true;
  }
}

export class DrawableContextMenuItem extends DrawableMenuItem {
  constructor(item: OsucadMenuItem) {
    super(item);

    this.backgroundColor = 'transparent';
    this.backgroundColorHover = 'rgba(255, 255, 255, 0.1)';
  }

  declare item: OsucadMenuItem;

  override createBackground(): Drawable {
    return new FastRoundedBox({
      relativeSizeAxes: Axes.Both,
      cornerRadius: 4,
    });
  }

  override createContent(): Drawable {
    return new ContextMenuItemContent(this.item).adjust((it) => {
      if (this.item.items.length > 0) {
        it.padding = new MarginPadding({
          ...it.padding,
          right: it.padding.right + 15,
        });
      }
    });
  }

  override loadComplete() {
    super.loadComplete();

    if (this.item.items.length > 0) {
      this.addInternal(
        new Caret().with({
          anchor: Anchor.CenterRight,
          origin: Anchor.CenterRight,
          color: OsucadColors.text,
          x: -6,
        }),
      );
    }

    this.clicked.addListener(() => {
      if (this.item.items.length === 0)
        this.findClosestParentOfType(ContextMenuContainer)?.hideActiveMenu();
    });
  }
}

class ContextMenuItemContent extends Container {
  constructor(readonly item: OsucadMenuItem) {
    super({
      autoSizeAxes: Axes.Both,
      padding: { horizontal: 10, vertical: 5 },
    });
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addAll(
      this.#spriteText = new OsucadSpriteText({
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
        text: this.#text,
        fontSize: 13,
        color:
        this.item.type === 'destructive'
          ? OsucadColors.danger
          : OsucadColors.text,
      }),
      new Container({ width: 60 }),
    );
  }

  #text: string = '';

  #spriteText?: SpriteText;

  get text() {
    return this.#text;
  }

  set text(value: string) {
    this.#text = value;
    if (this.#spriteText)
      this.#spriteText.text = value;
  }
}

class Caret extends GraphicsDrawable {
  constructor() {
    super();

    this.width = this.height = 8;
  }

  override updateGraphics(g: Graphics) {
    g.roundPoly(
      this.drawWidth / 2,
      this.drawHeight / 2,
      Math.min(this.drawWidth, this.drawHeight) / 2,
      3,
      1,
      Math.PI / 2,
    ).fill(0xFFFFFF);
  }
}
