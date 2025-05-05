import { PlayfieldAdjustmentContainer } from "@osucad/core";
import { Anchor, Container, Drawable, DrawSizePreservingFillContainer } from "@osucad/framework";

export class OsuPlayfieldAdjustmentContainer extends PlayfieldAdjustmentContainer 
{
  constructor() 
  {
    super();

    this.padding = 100;

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

  readonly _content: Container;

  override get content(): Container<Drawable> 
  {
    return this._content;
  }
}
