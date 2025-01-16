import type { Drawable } from '@osucad/framework';
import { Anchor, FastRoundedBox } from '@osucad/framework';
import { ArgonNotePiece } from './ArgonNotePiece';

export class ArgonHoldNoteHeadPiece extends ArgonNotePiece {
  protected override createIcon(): Drawable {
    return new FastRoundedBox({
      anchor: Anchor.Center,
      origin: Anchor.Center,
      y: 2,
      width: 20,
      height: 5,
      cornerRadius: 2.5,
    });
  }
}
