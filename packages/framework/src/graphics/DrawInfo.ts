import { Vec2 } from '../math';
import { Mat3 } from '../math/Mat3';

export class DrawInfo {
  localMatrix: Mat3;
  matrix: Mat3;
  matrixInverse: Mat3;

  constructor(
    localMatrix: Mat3 = new Mat3(),
    matrix: Mat3 = new Mat3(),
    matrixInverse: Mat3 = new Mat3(),
  ) {
    this.localMatrix = localMatrix;
    this.matrix = matrix;
    this.matrixInverse = matrixInverse;
  }

  reset() {
    this.localMatrix.identity();
    this.matrix.identity();
    this.matrixInverse.identity();
  }

  applyTransform(
    translation: Vec2,
    scale: Vec2,
    rotation: number,
    shear: Vec2,
    origin: Vec2,
  ) {
    if (!translation.isZero) {
      this.localMatrix.translateFromLeft(translation.x, translation.y);
      this.matrix.translateFromLeft(translation.x, translation.y);
      this.matrixInverse.translateFromRight(-translation.x, -translation.y);
    }


    if (rotation !== 0) {
      this.localMatrix.rotateFromLeft(rotation);
      this.matrix.rotateFromLeft(rotation);
      this.matrixInverse.rotateFromRight(-rotation);
    }

    if (!shear.isZero) {
      this.localMatrix.shearFromLeft(shear.x, shear.y);
      this.matrix.shearFromLeft(-shear.x, -shear.y);
      this.matrixInverse.shearFromRight(shear.x, shear.y);
    }

    if (!scale.isOne) {
      let x = scale.x;
      let y = scale.y;

      if (x === 0) x = 1e-3;
      if (y === 0) y = 1e-3;

      this.localMatrix.scaleFromLeft(x, y);
      this.matrix.scaleFromLeft(x, y);
      this.matrixInverse.scaleFromRight(1 / x, 1 / y);
    }

    if (!origin.isZero) {
      this.localMatrix.translateFromLeft(-origin.x, -origin.y);
      this.matrix.translateFromLeft(-origin.x, -origin.y);
      this.matrixInverse.translateFromRight(origin.x, origin.y);
    }

    return;
  }

  setFrom(other: DrawInfo) {
    this.matrix.copyFrom(other.matrix);
    this.matrixInverse.copyFrom(other.matrixInverse);
  }


}
