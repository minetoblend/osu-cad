import { Axes, Container } from 'osucad-framework';

export class Playground extends Container {
  constructor() {
    super({
      relativeSizeAxes: Axes.Both
    })
  }
}
