import { Container, Graphics, Ticker } from 'pixi.js';
import { dependencyLoader } from '../framework/di/DependencyLoader';
import { Drawable } from '../framework/drawable/Drawable';
import { Axes } from '../framework/drawable/Axes';

export class LoadingSpinner extends Drawable {
  drawNode = new Container();

  g = new Graphics().arc(0, 0, 32, 0, Math.PI * 2 * 0.75).stroke({
    color: 0xffffff,
    width: 4,
    alpha: 0.5,
    cap: 'round',
  });

  @dependencyLoader()
  load() {
    this.relativeSizeAxes = Axes.Both;
    this.drawNode.addChild(this.g);
  }

  override updateDrawNodeTransform(): void {
    super.updateDrawNodeTransform();
    this.g.position.set(this.drawSize.x / 2, this.drawSize.y / 2);
  }

  override update(): void {
    super.update();
    this.g.rotation += Ticker.shared.deltaTime * 0.25;
  }
}
