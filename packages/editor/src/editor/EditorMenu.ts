import gsap from 'gsap';
import type {
  Drawable,
  MenuItem,
  SpriteText,
} from 'osucad-framework';
import {
  Anchor,
  Axes,
  Color,
  Container,
  Direction,
  DrawableMenuItem,
  MarginPadding,
  Menu,
  RoundedBox,
  ScrollContainer,
  ScrollbarContainer,
  Vec2,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import { Graphics } from 'pixi.js';
import { OsucadSpriteText } from '../OsucadSpriteText';
import { ThemeColors } from './ThemeColors';

export class EditorMenu extends Menu {
  @resolved(ThemeColors)
  theme!: ThemeColors;

  @dependencyLoader()
  load() {
    if (this.topLevelMenu)
      return;

    this.backgroundColor = new Color(this.theme.translucent).setAlpha(0.85);
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
    return new (class extends ScrollContainer {
      constructor(direction: Direction) {
        super(direction);
        this.clampExtension = 0;
      }

      protected createScrollbar(direction: Direction): ScrollbarContainer {
        return new (class extends ScrollbarContainer {
          resizeTo(): void {

          }
        })(direction);
      }
    })(direction);
  }

  override animateOpen(): void {
    if (this.topLevelMenu) {
      super.animateOpen();
      return;
    }
    this.fadeIn({ duration: 200 });
  }

  #targetSize: Vec2 = new Vec2();

  protected override updateSize(newSize: Vec2): void {
    if (this.#targetSize.equals(newSize))
      return;

    gsap.killTweensOf(this, 'width,height');

    if (this.direction === Direction.Vertical) {
      if (newSize.y === 0) {
        newSize.x = this.width;
      }

      if (newSize.y > 0 && this.width === 0) {
        this.width = newSize.x;
      }

      gsap.to(this, {
        width: newSize.x,
        height: newSize.y,
        duration: 0.2,
        ease: 'power4.out',
      });
    }
    else {
      gsap.to(this, {
        width: newSize.x,
        height: newSize.y,
        duration: 0.2,
        ease: 'power4.out',
      });
    }
  }

  override animateClose(): void {
    if (this.topLevelMenu) {
      super.animateClose();
      return;
    }

    this.fadeOut({ duration: 200 });
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

  @dependencyLoader()
  load() {
    this.item.disabled.addOnChangeListener(
      (e) => {
        if (e.value) {
          this.foreground.alpha = 0.5;
        }
        else {
          this.foreground.alpha = 1;
        }
      },
      { immediate: true },
    );
  }
}

class MenuItemContent extends Container {
  constructor(readonly item: MenuItem) {
    let padding = MarginPadding.from({ horizontal: 8, vertical: 4 });

    if (item.items.length > 0) {
      padding = new MarginPadding({
        vertical: 4,
        left: 8,
        right: 32,
      });
    }

    super({
      autoSizeAxes: Axes.Both,
      padding,
    });
  }

  @dependencyLoader()
  load(): void {
    this.add(
      (this.#spriteText = new OsucadSpriteText({
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
        text: this.#text,
        fontSize: 14,
      })),
    );

    if (this.item.items.length > 0) {
      const child = new Container({
        anchor: Anchor.CenterRight,
        origin: Anchor.CenterRight,
        x: 20,
        alpha: 0.5,
      });
      this.add(child);

      const g = child.drawNode.addChild(new Graphics());

      g.roundPoly(0, 0, 4, 3, 1, Math.PI * 0.5).fill(0xFFFFFF);
    }
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
