import { Drawable } from 'osucad-framework';
import { Graphics } from 'pixi.js';
import type { SnapTarget } from './SnapTarget';

export class SnapVisualizer extends Drawable {
  #visualizer!: Graphics;

  createDrawNode(): Graphics {
    return this.#visualizer = new Graphics();
  }

  drawTargets(
    targets: SnapTarget[],
    active: SnapTarget | null = null,
  ) {
    this.clear();
    for (const t of targets) {
      t.draw(this.#visualizer, t === active);
    }
  }

  clear() {
    this.#visualizer.clear();
  }
}
