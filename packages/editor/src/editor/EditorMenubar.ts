import {
  Anchor,
  Axes,
  Color,
  Container,
  Direction,
  Drawable,
  DrawableMenuItem,
  Menu,
  MenuItem,
  RoundedBox,
  SpriteText,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import { DropShadowFilter } from 'pixi-filters';
import { EditorMenu } from './EditorMenu';
import { UIFonts } from './UIFonts';
import { CommandHandler } from './context/CommandHandler';

export class EditorMenubar extends EditorMenu {
  constructor() {
    super(Direction.Horizontal, true);

    this.margin = { horizontal: 4, vertical: 2 };

    this.backgroundColor = new Color('black').setAlpha(0);

    this.items = [
      new MenuItem({
        text: 'File',
        items: [
          new MenuItem({
            text: 'Exit',
          }),
          new MenuItem({
            text: 'Export',
            items: [
              new MenuItem({
                text: 'Export as .osu',
              }),
              new MenuItem({
                text: 'Export as .osz',
              }),
            ],
          }),
        ],
      }),
      new MenuItem({
        text: 'Edit',
        items: [
          (this.#undoItem = new MenuItem({
            text: 'Undo',
            action: () => this.commandHandler.undo(),
          })),
          (this.#redoItem = new MenuItem({
            text: 'Redo',
            action: () => this.commandHandler.redo(),
          })),
        ],
      }),
      new MenuItem({
        text: 'View',
      }),
      new MenuItem({
        text: 'Help',
      }),
    ];
  }

  #undoItem!: MenuItem;

  #redoItem!: MenuItem;

  @resolved(CommandHandler)
  commandHandler!: CommandHandler;

  override load() {
    super.load();

    this.commandHandler.canUndo.addOnChangeListener(
      (value) => (this.#undoItem.disabled.value = !value),
      { immediate: true },
    );
    this.commandHandler.canRedo.addOnChangeListener(
      (value) => (this.#redoItem.disabled.value = !value),
      { immediate: true },
    );
  }

  protected override createDrawableMenuItem(item: MenuItem): DrawableMenuItem {
    return new DrawableEditorMenubarItem(item);
  }

  protected createSubmenu(): Menu {
    const menu = super.createSubmenu();

    menu.filters = [
      new DropShadowFilter({
        alpha: 0.25,
        offset: { x: 0, y: 2 },
        quality: 2,
      }),
    ];

    return menu;
  }
}

class DrawableEditorMenubarItem extends DrawableMenuItem {
  constructor(item: MenuItem) {
    super(item);
    this.backgroundColor = 'transparent';
    this.backgroundColorHover = 'rgba(255, 255, 255, 0.1)';
    this.padding = { horizontal: 2 };
  }

  createContent(): Drawable {
    return new MenuItemContent();
  }

  createBackground(): Drawable {
    return new RoundedBox({
      color: 'transparent',
      cornerRadius: 4,
      relativeSizeAxes: Axes.Both,
    });
  }
}

class MenuItemContent extends Container {
  constructor() {
    super({
      autoSizeAxes: Axes.Both,
      padding: { horizontal: 6, vertical: 2 },
    });
  }

  @resolved(UIFonts)
  fonts!: UIFonts;

  @dependencyLoader()
  load(): void {
    this.add(
      (this.#spriteText = new SpriteText({
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
        text: this.#text,
        font: this.fonts.nunitoSans,
        style: {
          fontSize: 14,
          fill: 'white',
        },
      })),
    );
  }

  #text: string = '';

  #spriteText?: SpriteText;

  get text() {
    return this.#text;
  }

  set text(value: string) {
    this.#text = value;
    if (this.#spriteText) this.#spriteText.text = value;
  }
}
