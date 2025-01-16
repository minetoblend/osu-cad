import type { ReadonlyDependencyContainer } from '@osucad/framework';
import type { IHoldNoteBody } from './IHoldNoteBody';
import { Axes, Box, CompositeDrawable } from '@osucad/framework';

export class DefaultBodyPiece extends CompositeDrawable implements IHoldNoteBody {
  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.internalChildren = [
      new Box({
        relativeSizeAxes: Axes.Both,
        alpha: 0.5,
      }),
    ];
  }

  recycle(): void {

  }
}
