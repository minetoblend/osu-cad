import { Anchor, Axes, Container, MarginPadding, type MenuItem, type ReadonlyDependencyContainer, type SpriteText } from '@osucad/framework';
import { Graphics } from 'pixi.js';
import { OsucadSpriteText } from '../../drawables/OsucadSpriteText';

export class DrawableEditorMenuItemContent extends Container {
  constructor(readonly item: MenuItem) {
    let padding = MarginPadding.from({ horizontal: 10, vertical: 6 });

    if (item.items.length > 0) {
      padding = new MarginPadding({
        vertical: 6,
        left: 10,
        right: 32,
      });
    }

    super({
      autoSizeAxes: Axes.Both,
      padding,
    });
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.add(
      this.#spriteText = new OsucadSpriteText({
        anchor: Anchor.CenterLeft,
        origin: Anchor.CenterLeft,
        text: this.#text,
        fontSize: 14,
      }),
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

  protected get spriteText() {
    return this.#spriteText;
  }

  get text() {
    return this.#text;
  }

  set text(value: string) {
    this.#text = value;
    if (this.#spriteText)
      this.#spriteText.text = value;
  }
}
