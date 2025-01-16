import type { ReadonlyDependencyContainer, ValueChangedEvent } from '@osucad/framework';
import { IScrollingInfo, ScrollingDirection } from '@osucad/core';
import { Anchor, Axes, Bindable, CompositeDrawable, FastRoundedBox } from '@osucad/framework';
import { ArgonNotePiece } from './ArgonNotePiece';

export class ArgonHitTarget extends CompositeDrawable {
  private readonly direction = new Bindable<ScrollingDirection>(ScrollingDirection.Default);

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.relativeSizeAxes = Axes.X;
    this.height = ArgonNotePiece.NOTE_HEIGHT * ArgonNotePiece.NOTE_ACCENT_RATIO;

    this.internalChildren = [

      new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        alpha: 0.3,
        cornerRadius: ArgonNotePiece.CORNER_RADIUS,
        blendMode: 'add',
      }),
    ];

    this.direction.bindTo(dependencies.resolve(IScrollingInfo).direction);
    this.direction.bindValueChanged(this.#onDirectionChanged, this, true);
  }

  #onDirectionChanged(direction: ValueChangedEvent<ScrollingDirection>) {
    this.anchor = this.origin = direction.value === ScrollingDirection.Up ? Anchor.TopLeft : Anchor.BottomLeft;
  }
}
