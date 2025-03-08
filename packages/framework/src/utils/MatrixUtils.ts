import type { Matrix } from 'pixi.js';
import { Vec2 } from '../math/Vec2';

export class MatrixUtils {
  static extractScale(matrix: Matrix): Vec2 {
    const { a, b, c, d } = matrix;

    return new Vec2(
      Math.sqrt((a * a) + (b * b)),
      Math.sqrt((c * c) + (d * d)),
    );
  }
}
