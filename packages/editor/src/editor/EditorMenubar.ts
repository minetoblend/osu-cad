import type {
  Drawable,
  SpriteText,
} from 'osucad-framework';
import {
  Anchor,
  Axes,
  Color,
  Container,
  Direction,
  DrawableMenuItem,
  MenuItem,
  RoundedBox,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import { OsucadSpriteText } from '../OsucadSpriteText';
import { EditorMenu } from './EditorMenu';
import { ThemeColors } from './ThemeColors';
import { CommandManager } from './context/CommandManager';

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
          new MenuItem({
            text: 'Cut',
          }),
          new MenuItem({
            text: 'Copy',
          }),
          new MenuItem({
            text: 'Paste',
          }),
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

  @resolved(CommandManager)
  commandHandler!: CommandManager;

  override load() {
    super.load();

    this.commandHandler.canUndo.addOnChangeListener(
      value => (this.#undoItem.disabled.value = !value),
      { immediate: true },
    );
    this.commandHandler.canRedo.addOnChangeListener(
      value => (this.#redoItem.disabled.value = !value),
      { immediate: true },
    );
  }

  protected override createDrawableMenuItem(item: MenuItem): DrawableMenuItem {
    return new DrawableEditorMenubarItem(item);
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

  @resolved(ThemeColors)
  colors!: ThemeColors;

  @dependencyLoader()
  load(): void {
    this.add(
      (this.#spriteText = new OsucadSpriteText({
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
        text: this.#text,
        fontSize: 14,
        color: this.colors.text,
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
    if (this.#spriteText)
      this.#spriteText.text = value;
  }
}
