import type { ReadonlyDependencyContainer } from 'osucad-framework';
import type { BarLine } from '../BarLine';
import { ArmedState, SkinnableDrawable } from '@osucad/common';
import { Anchor, Axes, BindableBoolean } from 'osucad-framework';
import { DefaultBarLine } from '../../skinning/default/DefaultBarLine';
import { ManiaSkinComponentLookup } from '../../skinning/ManiaSkinComponentLookup';
import { ManiaSkinComponents } from '../../skinning/ManiaSkinComponents';
import { DrawableManiaHitObject } from './DrawableManiaHitObject';

export class DrawableBarLine extends DrawableManiaHitObject<BarLine> {
  readonly major = new BindableBoolean();

  constructor(barLine?: BarLine) {
    super(barLine);
    this.relativeSizeAxes = Axes.X;
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addInternal(new SkinnableDrawable(new ManiaSkinComponentLookup(ManiaSkinComponents.BarLine), () => new DefaultBarLine()).with({
      anchor: Anchor.Center,
      origin: Anchor.Center,
    }));

    this.major.bindValueChanged(major => this.height = major.value ? 1.7 : 1.2, undefined, true);
  }

  protected override onApplied() {
    super.onApplied();

    this.major.bindTo(this.hitObject.majorBindable);
  }

  protected override onFreed() {
    super.onFreed();

    this.major.unbindFrom(this.hitObject.majorBindable);
  }

  protected override updateStartTimeTransforms() {
    this.fadeOut(150);
  }

  override update() {
    super.update();
  }

  protected override updateHitStateTransforms(state: ArmedState) {
    super.updateHitStateTransforms(ArmedState.Idle);
  }
}
