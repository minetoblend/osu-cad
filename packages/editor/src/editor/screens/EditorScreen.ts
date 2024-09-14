import { Axes, Container, Invalidation, InvalidationSource } from 'osucad-framework';

export class EditorScreen extends Container{
  constructor() {
    super();
    this.relativeSizeAxes = Axes.Both;
  }

  get disposeOnDeathRemoval(): boolean {
    return false;
  }

  show() {
    this.fadeInFromZero(300);
  }

  hide() {
    this.fadeOut(300);
  }
}
