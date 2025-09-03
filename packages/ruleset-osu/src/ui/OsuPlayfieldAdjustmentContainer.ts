import { PlayfieldAdjustmentContainer } from "@osucad/core";
import type { Drawable } from "@osucad/framework";
import { Anchor, Container, DrawSizePreservingFillContainer } from "@osucad/framework";

export class OsuPlayfieldAdjustmentContainer extends PlayfieldAdjustmentContainer
{
  public constructor()
  {
    super();

    this.padding = 50;

    this.addInternal(
        new DrawSizePreservingFillContainer({
          targetDrawSize: {
            x: 512,
            y: 384,
          },
          child: this._content = new Container({
            width: 512,
            height: 384,
            anchor: Anchor.Center,
            origin: Anchor.Center,
          }),
        }),
    );
  }

  public readonly _content: Container;

  protected override get content(): Container<Drawable>
  {
    return this._content;
  }
}
