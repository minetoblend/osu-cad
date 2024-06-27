import { Container, PIXIContainer, PIXIGraphics, dependencyLoader } from "osucad-framework";

export class PlayfieldGrid extends Container {

  createDrawNode(): PIXIContainer{
      return new PIXIGraphics()
  }

  @dependencyLoader()
  init() {
    const g = this.drawNode as PIXIGraphics;

    g.rect(0, 0, 512, 384).stroke({
      color: 0xffffff,
      alpha: 0.5,
      width: 1,
    })
  }

}
