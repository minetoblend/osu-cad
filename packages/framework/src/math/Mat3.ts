import { Vec2 } from './Vec2.ts';
import { almostEquals } from '../utils';
import { Quad } from './Quad.ts';
import { Matrix } from 'pixi.js';

export class Mat3 {
  constructor(
    public m00 = 1, public m01 = 0, public m02 = 0,
    public m10 = 0, public m11 = 1, public m12 = 0,
    public m20 = 0, public m21 = 0, public m22 = 1,
  ) {
  }

  translateFromLeft(x: number, y: number) {
    // col2 += col0 * x + col1 * y;
    this.m02 += this.m00 * x + this.m01 * y;
    this.m12 += this.m10 * x + this.m11 * y;
    this.m22 += this.m20 * x + this.m21 * y;
  }

  translateFromRight(x: number, y: number) {
    // row0 += row2 * v.x
    this.m00 += this.m20 * x;
    this.m01 += this.m21 * x;
    this.m02 += this.m22 * x;

    // row1 += row2 * v.y
    this.m10 += this.m20 * y;
    this.m11 += this.m21 * y;
    this.m12 += this.m22 * y;
  }

  rotateFromLeft(angle: number) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const m00 = this.m00 * cos + this.m01 * sin;
    const m10 = this.m10 * cos + this.m11 * sin;
    const m20 = this.m20 * cos + this.m21 * sin;

    this.m01 = this.m01 * cos - this.m00 * sin;
    this.m11 = this.m11 * cos - this.m10 * sin;
    this.m21 = this.m21 * cos - this.m20 * sin;

    this.m00 = m00;
    this.m10 = m10;
    this.m20 = m20;
  }

  rotateFromRight(angle: number) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const m00 = this.m00 * cos - this.m10 * sin;
    const m01 = this.m01 * cos - this.m11 * sin;
    const m02 = this.m02 * cos - this.m12 * sin;

    this.m10 = this.m10 * cos + this.m00 * sin;
    this.m11 = this.m11 * cos + this.m01 * sin;
    this.m12 = this.m12 * cos + this.m02 * sin;

    this.m00 = m00;
    this.m01 = m01;
    this.m02 = m02;
  }

  scaleFromLeft(x: number, y: number) {
    this.m00 *= x;
    this.m10 *= x;
    this.m20 *= x;

    this.m01 *= y;
    this.m11 *= y;
    this.m21 *= y;
  }

  scaleFromRight(x: number, y: number) {
    this.m00 *= x;
    this.m01 *= x;
    this.m02 *= x;

    this.m10 *= y;
    this.m11 *= y;
    this.m12 *= y;
  }

  shearFromLeft(x: number, y: number) {
    const xy = x * y;

    //const col0 = this.col0 + this.col1 * y + this.col0 * x * y;
    const m00 = this.m00 + this.m01 * y + this.m00 * xy;
    const m10 = this.m10 + this.m11 * y + this.m10 * xy;
    const m20 = this.m20 + this.m21 * y + this.m20 * xy;

    this.m01 += this.m00 * x;
    this.m11 += this.m10 * x;
    this.m21 += this.m20 * x;

    this.m00 = m00;
    this.m10 = m10;
    this.m20 = m20;
  }

  shearFromRight(x: number, y: number) {
    const xy = x * y;

    const m00 = this.m00 + this.m10 * x;
    const m01 = this.m01 + this.m11 * x;
    const m02 = this.m02 + this.m12 * x;

    this.m10 += this.m00 * y + this.m10 * xy;
    this.m11 += this.m01 * y + this.m11 * xy;
    this.m12 += this.m02 * y + this.m12 * xy;

    this.m00 = m00;
    this.m01 = m01;
    this.m02 = m02;
  }

  fastInvert() {
    const a00 = this.m00, a01 = this.m01, a02 = this.m02;
    const a10 = this.m10, a11 = this.m11, a12 = this.m12;
    const a20 = this.m20, a21 = this.m21, a22 = this.m22;

    const b01 = a22 * a11 - a12 * a21;
    const b11 = -a22 * a10 + a12 * a20;
    const b21 = a21 * a10 - a11 * a20;

    let det = a00 * b01 + a01 * b11 + a02 * b21;

    if (almostEquals(det, 0.0, 1e-6)) {
      this.setZero();
      return this;
    }

    det = 1.0 / det;

    this.m00 = b01 * det;
    this.m01 = (-a22 * a01 + a02 * a21) * det;
    this.m02 = (a12 * a01 - a02 * a11) * det;
    this.m10 = b11 * det;
    this.m11 = (a22 * a00 - a02 * a20) * det;
    this.m12 = (-a12 * a00 + a02 * a10) * det;
    this.m20 = b21 * det;
    this.m21 = (-a21 * a00 + a01 * a20) * det;
    this.m22 = (a11 * a00 - a01 * a10) * det;

    return this;
  }

  setZero() {
    this.m00 = 0;
    this.m01 = 0;
    this.m02 = 0;

    this.m10 = 0;
    this.m11 = 0;
    this.m12 = 0;

    this.m20 = 0;
    this.m21 = 0;
    this.m22 = 0;
  }

  identity() {
    this.m00 = 1;
    this.m01 = 0;
    this.m02 = 0;

    this.m10 = 0;
    this.m11 = 1;
    this.m12 = 0;

    this.m20 = 0;
    this.m21 = 0;
    this.m22 = 1;
  }

  apply(pos: Vec2, target: Vec2 = new Vec2()) {
    const x = (this.m00 * pos.x) + (this.m01 * pos.y) + (this.m02);
    const y = (this.m10 * pos.x) + (this.m11 * pos.y) + (this.m12);

    target.x = x;
    target.y = y;

    return target;
  }

  copyFrom(other: Mat3) {
    this.m00 = other.m00;
    this.m01 = other.m01;
    this.m02 = other.m02;
    this.m10 = other.m10;
    this.m11 = other.m11;
    this.m12 = other.m12;
    this.m20 = other.m20;
    this.m21 = other.m21;
    this.m22 = other.m22;
    return this;
  }

  equals(other: Mat3) {
    return almostEquals(this.m00, other.m00)
      && almostEquals(this.m01, other.m01)
      && almostEquals(this.m02, other.m02)
      && almostEquals(this.m10, other.m10)
      && almostEquals(this.m11, other.m11)
      && almostEquals(this.m12, other.m12)
      && almostEquals(this.m20, other.m20)
      && almostEquals(this.m21, other.m21)
      && almostEquals(this.m22, other.m22);
  }

  clone() {
    return new Mat3(
      this.m00,
      this.m01,
      this.m02,
      this.m10,
      this.m11,
      this.m12,
      this.m20,
      this.m21,
      this.m22,
    );
  }

  applyToQuad(quad: Quad, target: Quad = quad) {
    this.apply(quad.topLeft, target.topLeft);
    this.apply(quad.topRight, target.topRight);
    this.apply(quad.bottomLeft, target.bottomLeft);
    this.apply(quad.bottomRight, target.bottomRight);

    return target;
  }

  multiply(other: Mat3) {
    const a00 = this.m00 * other.m00 + this.m01 * other.m10 + this.m02 * other.m20;
    const a01 = this.m00 * other.m01 + this.m01 * other.m11 + this.m02 * other.m21;
    const a02 = this.m00 * other.m02 + this.m01 * other.m12 + this.m02 * other.m22;
    const a10 = this.m10 * other.m00 + this.m11 * other.m10 + this.m12 * other.m20;
    const a11 = this.m10 * other.m01 + this.m11 * other.m11 + this.m12 * other.m21;
    const a12 = this.m10 * other.m02 + this.m11 * other.m12 + this.m12 * other.m22;
    const a20 = this.m20 * other.m00 + this.m21 * other.m10 + this.m22 * other.m20;
    const a21 = this.m20 * other.m01 + this.m21 * other.m11 + this.m22 * other.m21;
    const a22 = this.m20 * other.m02 + this.m21 * other.m12 + this.m22 * other.m22;

    this.m00 = a00;
    this.m01 = a01;
    this.m02 = a02;
    this.m10 = a10;
    this.m11 = a11;
    this.m12 = a12;
    this.m20 = a20;
    this.m21 = a21;
    this.m22 = a22;

    return this;
  }

  copyToPixiMatrix(matrix: Matrix) {
    matrix.a = this.m00;
    matrix.b = this.m01;
    matrix.c = this.m10;
    matrix.d = this.m11;
    matrix.tx = this.m02;
    matrix.ty = this.m12;
    return matrix;
  }
}
