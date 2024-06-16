import { Container } from "pixi.js";
import { Drawable } from "../framework/drawable/Drawable";

export class BeatInfo extends Drawable {
  constructor() {
    super();
  }

  override drawNode = new Container();
}
