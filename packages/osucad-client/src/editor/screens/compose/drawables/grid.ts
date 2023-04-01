import {Graphics} from "pixi.js";

export function createGrid() {
  const g = new Graphics()

  g.lineStyle(2, 0xffffff, 0.3)
  g.drawRoundedRect(0, 0, 512, 384, 2)


  return g
}
