import type { HoverEvent, HoverLostEvent } from 'osucad-framework';
import { Anchor, Axes, Container, FastRoundedBox } from 'osucad-framework';

export class HitObjectComposerSettingsContainer extends Container {
  constructor() {
    super({
      relativeSizeAxes: Axes.X,
      height: 24,
      padding: { bottom: 3 },
      anchor: Anchor.BottomLeft,
      origin: Anchor.BottomLeft,
    });

    this.addAllInternal(
      this.#background = new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        color: 0x222228,
        alpha: 0,
      }),
      this.#content = new Container({
        relativeSizeAxes: Axes.Both,
      }),
    );
  }

  readonly #background: FastRoundedBox;

  readonly #content: Container;

  override get content(): Container {
    return this.#content;
  }

  override onHover(e: HoverEvent): boolean {
    this.#background.fadeTo(0.5, 200);
    return true;
  }

  override onHoverLost(e: HoverLostEvent) {
    this.#background.fadeOut(200);
  }
}
