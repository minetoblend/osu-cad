import { Axes, Container } from '../../framework/src';

export class AspectContainer extends Container {
  update() {
    super.update();
    if (this.relativeSizeAxes === Axes.X)
      this.height = this.drawSize.x;
    else
      this.width = this.drawSize.y;
  }
}
