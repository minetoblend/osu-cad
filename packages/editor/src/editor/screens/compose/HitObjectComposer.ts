import { Axes, Container } from 'osucad-framework';

export class HitObjectComposer extends Container {
  constructor() {
    super({
      relativeSizeAxes: Axes.Both,
    });
  }
}
