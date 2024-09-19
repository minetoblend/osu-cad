import { Axes, Container, Invalidation, InvalidationSource } from 'osucad-framework';

export class EditorScreen extends Container{
  constructor() {
    super();
    this.relativeSizeAxes = Axes.Both;
  }

  show() {
    this.fadeInFromZero(300);
  }

  hide() {
    this.fadeOut(300);
  }
}
