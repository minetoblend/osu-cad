import type { ReadonlyDependencyContainer, ValueChangedEvent } from '@osucad/framework';
import type { ManiaHitObject } from '../ManiaHitObject';
import { ArmedState, DrawableHitObject, IScrollingInfo, ScrollingDirection } from '@osucad/core';
import { Anchor, Axes, Bindable, EasingFunction, resolved } from '@osucad/framework';
import { BindableManiaAction, ManiaAction } from '../../ui/ManiaAction';
import { ManiaPlayfield } from '../../ui/ManiaPlayfield';

export abstract class DrawableManiaHitObject<TObject extends ManiaHitObject = ManiaHitObject> extends DrawableHitObject {
  protected readonly action = new Bindable<ManiaAction>(ManiaAction.Key1);

  protected readonly direction = new Bindable<ScrollingDirection>(ScrollingDirection.Default);

  @resolved(() => ManiaPlayfield, true)
  protected playfield?: ManiaPlayfield;

  checkHittable?: (hitObject: DrawableHitObject, time: number) => boolean;

  override get hitObject(): TObject {
    return super.hitObject as TObject;
  }

  protected constructor(hitObject?: TObject) {
    super(hitObject);

    this.relativeSizeAxes = Axes.X;
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const action = dependencies.resolveOptional(BindableManiaAction);
    if (action)
      this.action.bindTo(action);

    const scrollingInfo = dependencies.resolve(IScrollingInfo);

    this.direction.bindTo(scrollingInfo.direction);
  }

  protected override loadComplete() {
    super.loadComplete();

    this.direction.bindValueChanged(this.onDirectionChanged, this, true);
  }

  protected onDirectionChanged(e: ValueChangedEvent<ScrollingDirection>) {
    this.anchor = this.origin = e.value === ScrollingDirection.Up ? Anchor.TopCenter : Anchor.BottomCenter;
  }

  protected override updateHitStateTransforms(state: ArmedState) {
    switch (state) {
      case ArmedState.Hit:
        this.fadeOut(150, EasingFunction.In);
        break;
      case ArmedState.Miss:
        this.fadeOut();
        break;
    }
  }

  missForcefully() {
    this.applyMinResult();
  }
}
