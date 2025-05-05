import type { OsucadBatchableQuadElement } from "./OsucadBatcher";
import { BatchableSprite, Rectangle } from "pixi.js";
import { Vec2 } from "../math";
import { OsucadBatcher } from "./OsucadBatcher";

export class OsucadBatchableSprite extends BatchableSprite implements OsucadBatchableQuadElement 
{
  public textureRect = new Rectangle();

  override batcherName = OsucadBatcher.extension.name;

  readonly blendRange = new Vec2(0.1, 0.1);
}
