import type { Vec2 } from '@osucad/framework';
import { Axes, Container, resolved } from '@osucad/framework';
import { MultiplayerCursorOverlay } from './MultiplayerCursorOverlay';

export class MultiplayerCursorArea extends Container {
  constructor(
    readonly key: string,
    readonly useProxy = true,
  ) {
    super();

    this.relativeSizeAxes = Axes.Both;
  }

  @resolved(MultiplayerCursorOverlay, true)
  cursorOverlay?: MultiplayerCursorOverlay;

  override get requestsPositionalInput(): boolean {
    return true;
  }

  toLocalCursorPosition(position: Vec2): Vec2 | null {
    return this.toLocalSpace(position);
  }

  toScreenSpaceCursorPosition(position: Vec2): Vec2 | null {
    return this.toScreenSpace(position);
  }

  protected override loadComplete() {
    super.loadComplete();

    this.cursorOverlay?.add(this);
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.cursorOverlay?.remove(this);
  }
}
