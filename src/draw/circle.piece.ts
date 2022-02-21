import {OsuCadContainer, ResourceProvider} from "@/draw/index";
import {PIXI} from "@/pixi";

export class CirclePiece extends OsuCadContainer {

  constructor(resourceProvider: ResourceProvider) {
    super(resourceProvider);
    const g = new PIXI.Graphics()

    g.lineStyle(4, 0xe78338)
    g.drawCircle(0, 0, 28)

    this.addChild(g)
  }
}