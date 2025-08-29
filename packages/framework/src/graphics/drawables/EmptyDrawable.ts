import { Container as PIXIContainer } from "pixi.js";
import { Drawable } from "./Drawable";

export class EmptyDrawable extends Drawable
{
  protected override createDrawNode(): PIXIContainer
  {
    return new PIXIContainer();
  }
}
