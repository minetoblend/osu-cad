import gsap from 'gsap';
import {
  Anchor,
  Axes,
  BasicScrollContainer,
  Color,
  Container,
  Direction,
  Drawable,
  DrawableMenuItem,
  MarginPadding,
  Menu,
  MenuItem,
  RoundedBox,
  ScrollContainer,
  SpriteText,
  Vec2,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import { Graphics } from 'pixi.js';
import { ThemeColors } from './ThemeColors';
import { UIFonts } from './UIFonts';

export class EditorMenu extends Menu {
  @resolved(ThemeColors)
  theme!: ThemeColors;

  @dependencyLoader()
  load() {
    if (this.topLevelMenu) return;

    this.backgroundColor = new Color(this.theme.translucent).setAlpha(0.7);
  }

  protected createBackground(): Drawable {
    return new RoundedBox({
      relativeSizeAxes: Axes.Both,
      cornerRadius: 4,
    });
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

  override animateOpen(): void {
    if (this.topLevelMenu) {
      super.animateOpen();
      return;
    }
    this.fadeIn({ duration: 0.2 });
  }

  protected override updateSize(newSize: Vec2): void {
    if (this.size.equals(newSize)) return;

    if (this.direction === Direction.Vertical) {
      this.scaleY = newSize.y === 0 ? 1 : this.size.y / newSize.y;
      gsap.to(this, {
        scaleY: 1,
        duration: 0.2,
        ease: 'power4.out',
      });
    } else {
      this.scaleX = this.size.x / newSize.x;
      gsap.to(this, {
        scaleX: 1,
        duration: 0.2,
        ease: 'power4.out',
      });
    }
    this.size = newSize;
  }

  override animateClose(): void {
    if (this.topLevelMenu) {
      super.animateClose();
      return;
    }

    this.fadeOut({ duration: 0.2 });
  }
}

class DrawableEditorMenuItem extends DrawableMenuItem {
  constructor(item: MenuItem) {
    super(item);
    this.backgroundColor = 'transparent';
    this.backgroundColorHover = 'rgba(255, 255, 255, 0.1)';
  }

  createContent(): Drawable {
    return new MenuItemContent(this.item);
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
  constructor(readonly item: MenuItem) {
    let padding = MarginPadding.from({ horizontal: 8, vertical: 4 });

    if (item.items.length > 0) {
      padding = new MarginPadding({
        vertical: 4,
        left: 8,
        right: 24,
      });
    }

    super({
      autoSizeAxes: Axes.Both,
      padding,
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

    if (this.item.items.length > 0) {
      const child = new Container({
        anchor: Anchor.CenterRight,
        origin: Anchor.CenterRight,
        x: 10,
        alpha: 0.5,
      });
      this.add(child);

      const g = child.drawNode.addChild(new Graphics());

      g.roundPoly(0, 0, 4, 3, 1, Math.PI * 0.5).fill(0xffffff);
    }
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
