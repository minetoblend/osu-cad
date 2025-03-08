import type {
  DefaultBatchableMeshElement,
  DefaultBatchableQuadElement,
  Geometry,
  Rectangle,
  Shader,
} from 'pixi.js';
import type { Vec2 } from '../math';
import {
  Batcher,
  ExtensionType,
} from 'pixi.js';

import { BatchShader } from './BatchShader';
import { OsucadBatchGeometry } from './OsucadBatchGeometry';

let shader: Shader = null!;

export interface OsucadBatchableQuadElement extends DefaultBatchableQuadElement {
  textureRect: Rectangle;
  blendRange: Vec2;
}

export interface OsucadBatchableMeshElement extends DefaultBatchableMeshElement {
  textureRect: Rectangle;
}

export class OsucadBatcher extends Batcher {
  public static extension = {
    type: [
      ExtensionType.Batcher,
    ],
    name: 'osucad',
  };

  override name: string = OsucadBatcher.extension.name;

  override geometry: Geometry = new OsucadBatchGeometry();
  override shader: Shader = shader ?? (shader = new BatchShader(this.maxTextures));
  // override shader = shader ?? new DefaultShader(this.maxTextures);

  protected override vertexSize: number = 12;

  override packAttributes(element: OsucadBatchableMeshElement, float32View: Float32Array, uint32View: Uint32Array, index: number, textureId: number): void {
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

    for (let i = offset; i < end; i++) {
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

  override packQuadAttributes(element: OsucadBatchableQuadElement, float32View: Float32Array, uint32View: Uint32Array, index: number, textureId: number): void {
    const texture = element.texture;

    const wt = element.transform;

    const a = wt.a;
    const b = wt.b;
    const c = wt.c;
    const d = wt.d;
    const tx = wt.tx;
    const ty = wt.ty;

    const bounds = element.bounds;

    const textureRect = element.textureRect;

    const trx2 = textureRect.x + textureRect.width;
    const try2 = textureRect.y + textureRect.height;

    const w0 = bounds.maxX;
    const w1 = bounds.minX;
    const h0 = bounds.maxY;
    const h1 = bounds.minY;

    const uvs = texture.uvs;

    const blendRange = element.blendRange;

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

    float32View[index + 6] = textureRect.x;
    float32View[index + 7] = textureRect.y;
    float32View[index + 8] = trx2;
    float32View[index + 9] = try2;

    float32View[index + 10] = blendRange.x;
    float32View[index + 11] = blendRange.y;

    // xy
    float32View[index + 12] = (a * w0) + (c * h1) + tx;
    float32View[index + 13] = (d * h1) + (b * w0) + ty;

    float32View[index + 14] = uvs.x1;
    float32View[index + 15] = uvs.y1;

    uint32View[index + 16] = argb;
    uint32View[index + 17] = textureIdAndRound;

    float32View[index + 18] = textureRect.x;
    float32View[index + 19] = textureRect.y;
    float32View[index + 20] = trx2;
    float32View[index + 21] = try2;

    float32View[index + 22] = blendRange.x;
    float32View[index + 23] = blendRange.y;

    // xy
    float32View[index + 24] = (a * w0) + (c * h0) + tx;
    float32View[index + 25] = (d * h0) + (b * w0) + ty;

    float32View[index + 26] = uvs.x2;
    float32View[index + 27] = uvs.y2;

    uint32View[index + 28] = argb;
    uint32View[index + 29] = textureIdAndRound;

    float32View[index + 30] = textureRect.x;
    float32View[index + 31] = textureRect.y;
    float32View[index + 32] = trx2;
    float32View[index + 33] = try2;

    float32View[index + 34] = blendRange.x;
    float32View[index + 35] = blendRange.y;

    // xy
    float32View[index + 36] = (a * w1) + (c * h0) + tx;
    float32View[index + 37] = (d * h0) + (b * w1) + ty;

    float32View[index + 38] = uvs.x3;
    float32View[index + 39] = uvs.y3;

    uint32View[index + 40] = argb;
    uint32View[index + 41] = textureIdAndRound;

    float32View[index + 42] = textureRect.x;
    float32View[index + 43] = textureRect.y;
    float32View[index + 44] = trx2;
    float32View[index + 45] = try2;

    float32View[index + 46] = blendRange.x;
    float32View[index + 47] = blendRange.y;
  }
}
