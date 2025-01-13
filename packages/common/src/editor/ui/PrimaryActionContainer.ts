import type { Drawable, HoverEvent, HoverLostEvent, MouseDownEvent, MouseUpEvent } from 'osucad-framework';
import { Anchor, Axes, CompositeDrawable, Container, EasingFunction, FastRoundedBox, FillDirection, FillFlowContainer, MouseButton, Vec2 } from 'osucad-framework';
import { OsucadSpriteText } from '../../drawables/OsucadSpriteText';
import { OsucadColors } from '../../OsucadColors';
import { Corner } from './Corner';
import { EditorCornerContent } from './EditorCornerContent';

export class PrimaryActionContainer extends EditorCornerContent {
  constructor() {
    super(Corner.TopLeft);

    this.autoSizeAxes = Axes.X;

    this.padding = { horizontal: 6, vertical: 8 };

    this.child = new FillFlowContainer({
      direction: FillDirection.Horizontal,
      autoSizeAxes: Axes.X,
      relativeSizeAxes: Axes.Y,
      spacing: new Vec2(4),
      children: [
        new TextButton('Undo'),
      ],
    });
  }

  override onEntering(previous: EditorCornerContent | null) {
    if (previous instanceof PrimaryActionContainer)
      return;

    super.onEntering(previous);
  }

  override onExiting(next: EditorCornerContent | null) {
    if (next instanceof PrimaryActionContainer)
      return;

    super.onExiting(next);
  }
}

class TextButton extends CompositeDrawable {
  constructor(text: string) {
    super();

    this.internalChildren = [
      this.#background = new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        alpha: 0,
        cornerRadius: 4,
      }),
      this.#content = new Container({
        autoSizeAxes: Axes.Both,
        padding: { horizontal: 8, vertical: 4 },
        child: this.#text = new OsucadSpriteText({
          text,
          color: OsucadColors.text,
          fontSize: 14,
          anchor: Anchor.Center,
          origin: Anchor.Center,
        }),
      }),
    ];
  }

  readonly #background!: Drawable;

  readonly #text: Drawable;

  #content: Container;

  override onHover(e: HoverEvent): boolean {
    this.#background.fadeTo(0.1, 200);
    return true;
  }

  override onHoverLost(e: HoverLostEvent) {
    this.#background.fadeOut(100);
  }

  override get drawSize(): Vec2 {
    return this.#content.drawSize;
  }

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left)
      this.#text.scaleTo(0.9, 300, EasingFunction.OutExpo);

    return true;
  }

  override onMouseUp(e: MouseUpEvent) {
    if (e.button === MouseButton.Left)
      this.#text.scaleTo(1, 300, EasingFunction.OutBack);

    return true;
  }
}
