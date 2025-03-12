import type { Bindable, ReadonlyDependencyContainer } from '@osucad/framework';
import { ComposeToolbar, HitObjectComposerDependencies } from '@osucad/core';
import { Axes, CompositeDrawable, EasingFunction, resolved } from '@osucad/framework';
import { PlaceClient } from './PlaceClient';

export class PlaceToolbar extends CompositeDrawable {
  #toolbar!: ComposeToolbar;

  @resolved(PlaceClient)
  client!: PlaceClient;

  canPlace!: Bindable<boolean>;

  protected load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.autoSizeAxes = Axes.X;
    this.relativeSizeAxes = Axes.Y;

    const { tools } = dependencies.resolve(HitObjectComposerDependencies);

    this.addInternal(
      this.#toolbar = new ComposeToolbar(tools),
    );

    this.canPlace = this.client.canPlace.getBoundCopy();
  }

  protected loadComplete() {
    super.loadComplete();

    this.canPlace.bindValueChanged((evt) => {
      this.#toolbar.fadeTo(evt.value ? 1.0 : 0.5, 400)
        .moveToX(evt.value ? 0 : -100, 700, EasingFunction.OutBack);
    }, true);
    this.finishTransforms(true);
  }
}
