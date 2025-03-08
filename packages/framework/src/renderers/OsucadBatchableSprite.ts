import {BatchableSprite, Rectangle} from "pixi.js";
import {OsucadBatchableQuadElement, OsucadBatcher} from "./OsucadBatcher";
import {Vec2} from "../math";

export class OsucadBatchableSprite extends BatchableSprite implements OsucadBatchableQuadElement {
  public textureRect!: Rectangle;

  override batcherName = OsucadBatcher.extension.name

  readonly blendRange = new Vec2(0.1, 0.1)
}
