import type {
  Bindable,
  ReadonlyDependencyContainer,
} from 'osucad-framework';
import type { DrawableComposeTool } from './DrawableComposeTool';
import type { IComposeTool } from './IComposeTool';
import {
  Axes,
  CompositeDrawable,
  dependencyLoader,
} from 'osucad-framework';
import { HitObjectComposerDependencies } from './HitObjectComposerDependencies';

export class ComposeToolContainer extends CompositeDrawable {
  activeTool!: Bindable<IComposeTool>;

  #activeDrawableTool?: DrawableComposeTool;

  @dependencyLoader()
  [Symbol('load')](dependencies: ReadonlyDependencyContainer) {
    const { activeTool } = dependencies.resolve(HitObjectComposerDependencies);
    this.activeTool = activeTool.getBoundCopy();

    this.relativeSizeAxes = Axes.Both;

    activeTool.addOnChangeListener((tool) => {
      this.#activeDrawableTool?.expire();
      this.addInternal(
        this.#activeDrawableTool = tool.value.createDrawableTool(),
      );
    }, { immediate: true });
  }
}
