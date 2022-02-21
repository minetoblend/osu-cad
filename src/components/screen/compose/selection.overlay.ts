import {OsuCadContainer, ResourceProvider} from "@/draw";
import {PIXI} from "@/pixi";

export class SelectionOverlay extends OsuCadContainer {

  readonly circlePieceContainer: PIXI.Container

  constructor(resourceProvider: ResourceProvider) {
    super(resourceProvider);

    this.circlePieceContainer = new PIXI.Container()
    this.addChild(this.circlePieceContainer)
  }
}