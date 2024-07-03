import { Axes, Bindable, Container, dependencyLoader } from 'osucad-framework';
import type { ToolConstructor } from './ComposeScreen';

export class HitObjectComposer extends Container {
  constructor(protected readonly activeTool: Bindable<ToolConstructor>) {
    super({
      relativeSizeAxes: Axes.Both,
    });
  }

  #toolContainer = new Container({
    relativeSizeAxes: Axes.Both,
  });

  @dependencyLoader()
  load() {
    this.addInternal(this.#toolContainer);

    this.activeTool.addOnChangeListener(
      (tool) => {
        if (
          this.#toolContainer.children.length === 0 ||
          !(this.#toolContainer.child instanceof tool)
        ) {
          this.#toolContainer.child = new tool();
        }
      },
      { immediate: true },
    );
  }
}
