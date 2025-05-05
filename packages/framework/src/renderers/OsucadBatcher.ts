import type {
  DefaultBatchableMeshElement,
  DefaultBatchableQuadElement,
  Geometry,
  Rectangle,
  Shader,
} from "pixi.js";
import type { Vec2 } from "../math";
import {
  Batcher,
  ExtensionType,
} from "pixi.js";

import { OsucadBatchGeometry } from "./OsucadBatchGeometry";
import { BatchShader } from "./shaders/BatchShader";

let shader: Shader = null!;

export interface OsucadBatchableQuadElement extends DefaultBatchableQuadElement
{
  textureRect: Rectangle;
  blendRange: Vec2;
}

export interface OsucadBatchableMeshElement extends DefaultBatchableMeshElement
{
  textureRect: Rectangle;
}

export class OsucadBatcher extends Batcher
{
  public static extension = {
    type: [
      ExtensionType.Batcher,
    ],
    name: "osucad",
  };

  override name: string = OsucadBatcher.extension.name;

  override geometry: Geometry = new OsucadBatchGeometry();
  override shader: Shader = shader ?? (shader = new BatchShader(this.maxTextures));

  protected override vertexSize: number = 6;

  override packAttributes(element: OsucadBatchableMeshElement, float32View: Float32Array, uint32View: Uint32Array, index: number, textureId: number): void
  {
    const textureIdAndRound = (textureId << 16) | (element.roundPixels & 0xFFFF);

    const wt = element.transform;

    const a = wt.a;
    const b = wt.b;
    const c = wt.c;
    const d = wt.d;
    const tx = wt.tx;
    const ty = wt.ty;

    const { positions, uvs } = element;

    const argb = element.color;

    const offset = element.attributeOffset;
    const end = offset + element.attributeSize;

    for (let i = offset; i < end; i++)
    {
      const i2 = i * 2;

      const x = positions[i2];
      const y = positions[(i2) + 1];

      float32View[index++] = (a * x) + (c * y) + tx;
      float32View[index++] = (d * y) + (b * x) + ty;

      float32View[index++] = uvs[i2];
      float32View[index++] = uvs[(i2) + 1];

      uint32View[index++] = argb;
      uint32View[index++] = textureIdAndRound;
    }
  }

  override packQuadAttributes(element: OsucadBatchableQuadElement, float32View: Float32Array, uint32View: Uint32Array, index: number, textureId: number): void
  {
    const texture = element.texture;

    const wt = element.transform;

    const a = wt.a;
    const b = wt.b;
    const c = wt.c;
    const d = wt.d;
    const tx = wt.tx;
    const ty = wt.ty;

    const bounds = element.bounds;

    const w0 = bounds.maxX;
    const w1 = bounds.minX;
    const h0 = bounds.maxY;
    const h1 = bounds.minY;

    const uvs = texture.uvs;

    // _ _ _ _
    // a b g r
    const argb = element.color;

    const textureIdAndRound = (textureId << 16) | (element.roundPixels & 0xFFFF);

    float32View[index + 0] = (a * w1) + (c * h1) + tx;
    float32View[index + 1] = (d * h1) + (b * w1) + ty;

    float32View[index + 2] = uvs.x0;
    float32View[index + 3] = uvs.y0;

    uint32View[index + 4] = argb;
    uint32View[index + 5] = textureIdAndRound;

    // xy
    float32View[index + 6] = (a * w0) + (c * h1) + tx;
    float32View[index + 7] = (d * h1) + (b * w0) + ty;

    float32View[index + 8] = uvs.x1;
    float32View[index + 9] = uvs.y1;

    uint32View[index + 10] = argb;
    uint32View[index + 11] = textureIdAndRound;

    // xy
    float32View[index + 12] = (a * w0) + (c * h0) + tx;
    float32View[index + 13] = (d * h0) + (b * w0) + ty;

    float32View[index + 14] = uvs.x2;
    float32View[index + 15] = uvs.y2;

    uint32View[index + 16] = argb;
    uint32View[index + 17] = textureIdAndRound;

    // xy
    float32View[index + 18] = (a * w1) + (c * h0) + tx;
    float32View[index + 19] = (d * h0) + (b * w1) + ty;

    float32View[index + 20] = uvs.x3;
    float32View[index + 21] = uvs.y3;

    uint32View[index + 22] = argb;
    uint32View[index + 23] = textureIdAndRound;
  }
}
