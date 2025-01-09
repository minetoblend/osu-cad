import type { ArmedState } from '@osucad/common';
import type { KeyBindingPressEvent, KeyBindingReleaseEvent } from 'osucad-framework';
import type { ManiaAction } from '../../ui/ManiaAction';
import type { HeadNote } from '../HeadNote';
import { Anchor } from 'osucad-framework';
import { ManiaSkinComponents } from '../../skinning/ManiaSkinComponents';
import { DrawableNote } from './DrawableNote';

export class DrawableHoldNoteHead extends DrawableNote {
  protected override get component(): ManiaSkinComponents {
    return ManiaSkinComponents.HoldNoteHead;
  }

  constructor(headNote?: HeadNote) {
    super(headNote);

    this.anchor = Anchor.TopCenter;
    this.origin = Anchor.TopCenter;
  }

  protected override updateHitStateTransforms(state: ArmedState) {
    this.lifetimeEnd = Number.POSITIVE_INFINITY;
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
