import type { KeyBindingPressEvent, KeyBindingReleaseEvent } from 'osucad-framework';
import type { ManiaAction } from '../../ui/ManiaAction';
import type { TailNote } from '../TailNote';
import { Anchor } from 'osucad-framework';
import { ManiaSkinComponents } from '../../skinning/ManiaSkinComponents';
import { DrawableNote } from './DrawableNote';

export class DrawableHoldNoteTail extends DrawableNote {
  protected override get component(): ManiaSkinComponents {
    return ManiaSkinComponents.HoldNoteTail;
  }

  constructor(tailNote?: TailNote) {
    super(tailNote);

    this.anchor = Anchor.TopCenter;
    this.origin = Anchor.TopCenter;
  }

  override updateResult(userTriggered: boolean = true): boolean {
    return super.updateResult(userTriggered);
  }

  override onKeyBindingPressed(e: KeyBindingPressEvent<ManiaAction>): boolean {
    return false;
  }

  onKeyBindingReleased(e: KeyBindingReleaseEvent<ManiaAction>) {
  }
}
