import type {
  Drawable,
  IKeyBindingHandler,
  KeyBindingPressEvent,
  SpriteText,
} from 'osucad-framework';
import {
  Anchor,
  Axes,
  Color,
  Container,
  dependencyLoader,
  Direction,
  DrawableMenuItem,
  MenuItem,
  PlatformAction,
  resolved,
  RoundedBox,
} from 'osucad-framework';
import { Notification } from '../notifications/Notification';
import { NotificationOverlay } from '../notifications/NotificationOverlay';
import { OsucadSpriteText } from '../OsucadSpriteText';
import { CommandManager } from './context/CommandManager';
import { Editor } from './Editor';
import { EditorMenu } from './EditorMenu';
import { ThemeColors } from './ThemeColors';

export class EditorMenubar extends EditorMenu implements IKeyBindingHandler<PlatformAction> {
  constructor() {
    super(Direction.Horizontal, true);

    this.margin = { horizontal: 4, vertical: 2 };

    this.backgroundColor = new Color('black').setAlpha(0);

    this.items = [
      new MenuItem({
        text: 'File',
        items: [
          new MenuItem({
            text: 'Save',
            action: () => this.save(),
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
          new MenuItem({
            text: 'Exit',
            action: () => this.exit(),
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
            action: () => this.editor?.cut(),
          }),
          new MenuItem({
            text: 'Copy',
            action: () => this.editor?.copy(),
          }),
          new MenuItem({
            text: 'Paste',
            action: () => this.editor?.paste(),
          }),
          new MenuItem({
            text: 'Reverse',
            action: () => this.reverseSelection(),
            items: [
              new MenuItem({
                text: 'Without reversing sliders',
                action: () => this.reverseSelection(),
              }),
            ],
          }),
        ],
      }),
      new MenuItem({
        text: 'View',
        items: [
          new MenuItem({
            text: 'Fullscreen',
            action: async () => {
              await document.body.querySelector('canvas')?.requestFullscreen({
                navigationUI: 'hide',
              });
            },
          }),
        ],
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

  reverseSelection() {
    console.log('reverse');
  }

  @resolved(NotificationOverlay)
  notifications!: NotificationOverlay;

  async save() {
    let result = false;

    if (this.editor!.commandManager.hasUnsavedChanges) {
      result = await this.editor!.context.save?.() ?? false;
    }
    else {
      result = true;
    }

    if (result) {
      this.notifications.add(new Notification(
        'Saved beatmap',
        undefined,
        this.theme.primary,
      ));
      this.editor!.commandManager.hasUnsavedChanges = false;
    }
    else {
      this.notifications.add(new Notification(
        'Error',
        'An unexpected error happened when saving the beatmap.',
        0xEB345E,
      ));
    }
  }

  override load() {
    super.load();

    this.commandHandler.canUndo.addOnChangeListener(
      ({ value }) => (this.#undoItem.disabled.value = !value),
      { immediate: true },
    );
    this.commandHandler.canRedo.addOnChangeListener(
      ({ value }) => (this.#redoItem.disabled.value = !value),
      { immediate: true },
    );
  }

  protected override createDrawableMenuItem(item: MenuItem): DrawableMenuItem {
    return new DrawableEditorMenubarItem(item);
  }

  exit() {
    this.editor?.performExit();
  }

  get editor() {
    return this.findClosestParentOfType(Editor);
  }

  override updateSubTree(): boolean {
    const result = super.updateSubTree();
    return result;
  }

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: PlatformAction) {
    return binding instanceof PlatformAction;
  }

  onKeyBindingPressed(e: KeyBindingPressEvent<PlatformAction>) {
    if (e.pressed === PlatformAction.Save) {
      this.save();
      return true;
    }

    return false;
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
