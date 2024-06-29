import { Axes, Container } from 'osucad-framework';

export abstract class ComposeTool extends Container {
  protected constructor() {
    super({
      relativeSizeAxes: Axes.Both,
    });
  }
}
