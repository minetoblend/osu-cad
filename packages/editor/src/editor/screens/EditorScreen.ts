import { Axes, Container } from 'osucad-framework';

export class EditorScreen extends Container {
  constructor() {
    super();
    this.relativeSizeAxes = Axes.Both;
  }

  show() {
    this.fadeIn(300);
  }

  hide() {
    this.fadeOut(300);
  }
}
