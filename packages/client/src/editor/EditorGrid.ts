import { Graphics } from 'pixi.js';
import { Drawable } from '../framework/drawable/Drawable';

export class EditorGrid extends Drawable {
  constructor() {
    super();
    this.updateGrid();
  }

  override drawNode = new Graphics();

  gridSize = 32;

  override receivePositionalInputAt(): boolean {
    return false;
  }

  updateGrid() {
    const g = this.drawNode;

    g.clear().roundRect(0, 0, 512, 384, 1).stroke({
      color: 0xffffff,
      width: 1,
      alpha: 0.5,
    });

    for (let x = this.gridSize; x < 512; x += this.gridSize) {
      if (x === 256) continue;
      g.moveTo(x, 0).lineTo(x, 384);
    }

    for (let y = this.gridSize; y < 384; y += this.gridSize) {
      if (y === 192) continue;
      g.moveTo(0, y).lineTo(512, y);
    }

    g.stroke({
      color: 0xffffff,
      width: 0.5,
      alpha: 0.2,
    });

    g.moveTo(256, 0).lineTo(256, 384);
    g.moveTo(0, 192).lineTo(512, 192);
    g.stroke({
      color: 0xffffff,
      width: 0.5,
      alpha: 0.4,
    });
  }
}
