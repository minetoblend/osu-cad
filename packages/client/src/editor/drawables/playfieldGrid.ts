import {Container, Graphics} from "pixi.js";


export class PlayfieldGrid extends Container {

  private readonly graphics = new Graphics();

  constructor() {
    super();
    this.addChild(this.graphics);
    this.update();
  }

  update() {
    const g = this.graphics;
    const gridSize = 32;

    g.clear();

    for (let x = gridSize; x < 512; x += gridSize) {
      if (x == 256) continue;
      g.moveTo(x, 0);
      g.lineTo(x, 384);
    }
    for (let y = gridSize; y < 384; y += gridSize) {
      if (y == 192) continue;
      g.moveTo(0, y);
      g.lineTo(512, y);
    }
    g.roundRect(0, 0, 512, 384, 2);
    g.stroke({ width: 0.5, color: 0xffffff, alpha: 0.5 });

    g.moveTo(0, 192);
    g.lineTo(512, 192);
    g.moveTo(256, 0);
    g.lineTo(256, 384);
    g.stroke({ width: 1, color: 0xffffff, alpha: 0.5 });
  }
}