import { Container } from "pixi.js";
import { Drawable } from "./Drawable";

export class Component extends Drawable {
  drawNode = new Container();
}
