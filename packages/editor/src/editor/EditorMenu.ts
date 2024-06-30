import {
  Anchor,
  Axes,
  BasicScrollContainer,
  Box,
  Color,
  Container,
  Direction,
  Drawable,
  DrawableMenuItem,
  Menu,
  MenuItem,
  RoundedBox,
  ScrollContainer,
  SpriteText,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import { UIFonts } from './UIFonts';
import gsap from 'gsap';
import { ThemeColors } from './ThemeColors';

export class EditorMenu extends Menu {
  @resolved(ThemeColors)
  theme!: ThemeColors;

  @dependencyLoader()
  load() {
    if (this.topLevelMenu) return;

    this.backgroundColor = new Color(this.theme.translucent).setAlpha(0.7);
  }

  protected createSubmenu(): Menu {
    return new EditorMenu(Direction.Vertical);
  }

  protected createDrawableMenuItem(item: MenuItem): DrawableMenuItem {
    return new DrawableEditorMenuItem(item);
  }

  protected createScrollContainer(direction: Direction): ScrollContainer {
    return new BasicScrollContainer(direction);
  }

  animateOpen(): void {
    if (this.topLevelMenu) {
      super.animateOpen();
      return;
    }
    this.scaleY = 0.5;
    gsap.to(this, { scaleY: 1, alpha: 1, duration: 0.2, ease: 'power4.out' });
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
          fontSize: 16,
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
