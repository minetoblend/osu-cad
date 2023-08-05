import {Graphics} from "pixi.js";

export function createGrid() {
  const g = new Graphics();

  g.lineStyle(2, 0xffffff, 1);
  g.drawRoundedRect(0, 0, 512, 384, 2);

  return g;
}
