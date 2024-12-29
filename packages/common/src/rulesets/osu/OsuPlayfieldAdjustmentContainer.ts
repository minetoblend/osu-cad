import type { Drawable } from 'osucad-framework';
import { Anchor, Container, DrawSizePreservingFillContainer } from 'osucad-framework';
import { PlayfieldAdjustmentContainer } from '../ui/PlayfieldAdjustmentContainer';

export class OsuPlayfieldAdjustmentContainer extends PlayfieldAdjustmentContainer {
  constructor() {
    super();

    this.addInternal(
      new DrawSizePreservingFillContainer({
        targetDrawSize: {
          x: 512,
          y: 384,
        },
        child: this.#content = new Container({
          width: 512,
          height: 384,
          anchor: Anchor.Center,
          origin: Anchor.Center,
        }),
      }),
    );
  }

  #content!: Container;

  override get content(): Container<Drawable> {
    return this.#content;
  }
}
