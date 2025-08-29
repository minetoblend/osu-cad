import type { OsucadBatchableQuadElement } from "./OsucadBatcher";
import { BatchableSprite, Rectangle } from "pixi.js";
import { Vec2 } from "../math";
import { OsucadBatcher } from "./OsucadBatcher";

export class OsucadBatchableSprite extends BatchableSprite implements OsucadBatchableQuadElement
{
  public textureRect = new Rectangle();

  public override batcherName = OsucadBatcher.extension.name;

  public readonly blendRange = new Vec2(0.1, 0.1);
}
