import {
  Anchor,
  Axes,
  Color,
  Container,
  Direction,
  Drawable,
  DrawableMenuItem,
  MarginPadding,
  MenuItem,
  RoundedBox,
  SpriteText,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import { EditorMenu } from './EditorMenu';
import { UIFonts } from './UIFonts';

export class EditorMenubar extends EditorMenu {
  constructor() {
    super(Direction.Horizontal, true);

    this.margin = { horizontal: 8 };

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
    ];
  }

  protected override createDrawableMenuItem(item: MenuItem): DrawableMenuItem {
    return new DrawableEditorMenuItem(item);
  }
}

class DrawableEditorMenuItem extends DrawableMenuItem {
  constructor(item: MenuItem) {
    super(item);
    this.backgroundColor = 'transparent';
    this.backgroundColorHover = 'rgba(255, 255, 255, 0.1)';
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
      padding: { horizontal: 8, vertical: 4 },
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
