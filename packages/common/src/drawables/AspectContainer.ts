import { Axes, Container } from 'osucad-framework';

export class AspectContainer extends Container {
  override update() {
    super.update();
    if (this.relativeSizeAxes === Axes.X)
      this.height = this.drawSize.x;
    else
      this.width = this.drawSize.y;
  }
}
