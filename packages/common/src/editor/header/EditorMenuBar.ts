import type { Drawable, IKeyBindingHandler, KeyBindingAction, SpriteText, Vec2 } from 'osucad-framework';
import { Anchor, Axes, Color, Container, dependencyLoader, Direction, DrawableMenuItem, FastRoundedBox, MenuItem, PlatformAction, resolved } from 'osucad-framework';
import { OsucadSpriteText } from '../../drawables/OsucadSpriteText';
import { OsucadColors } from '../../OsucadColors';
import { CommandManager } from '../CommandManager';
import { Editor } from '../Editor';
import { EditorMenu } from './EditorMenu';

export class EditorMenubar extends EditorMenu implements IKeyBindingHandler<PlatformAction> {
  constructor() {
    super(Direction.Horizontal, true);

    this.margin = { horizontal: 4, vertical: 2 };

    this.backgroundColor = new Color('black').setAlpha(0);
  }

  protected override loadComplete() {
    super.loadComplete();

    this.createMenuItems();
  }

  @resolved(() => Editor)
  editor!: Editor;

  createMenuItems() {
    this.items = this.editor.createMenuItems();
  }

  protected createFileMenu(): MenuItem {
    return new MenuItem({
      text: 'File',
    });
  }

  protected createEditMenu(): MenuItem {
    return new MenuItem({
      text: 'Edit',
    });
  }

  protected createViewMenu(): MenuItem {
    return new MenuItem({
      text: 'View',
    });
  }

  protected createHelpMenu(): MenuItem {
    return new MenuItem({
      text: 'Help',
    });
  }

  protected override updateSize(newSize: Vec2) {
    this.size = newSize;
  }

  @resolved(CommandManager)
  commandHandler!: CommandManager;

  protected override createDrawableMenuItem(item: MenuItem): DrawableMenuItem {
    return new DrawableEditorMenubarItem(item);
  }

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: KeyBindingAction) {
    return binding instanceof PlatformAction;
  }
}

export class DrawableEditorMenubarItem extends DrawableMenuItem {
  constructor(item: MenuItem) {
    super(item);
    this.backgroundColor = 'transparent';
    this.backgroundColorHover = 'rgba(255, 255, 255, 0.1)';
    this.padding = { horizontal: 2 };
  }

  createContent(): Drawable {
    return new MenuItemContent();
  }

  override createBackground(): Drawable {
    return new FastRoundedBox({
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
      padding: { horizontal: 10, vertical: 4 },
    });
  }

  @dependencyLoader()
  [Symbol('load')](): void {
    this.add(
      (this.#spriteText = new OsucadSpriteText({
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
        text: this.#text,
        fontSize: 14,
        color: OsucadColors.text,
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
