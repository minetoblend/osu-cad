import { Vec2 } from 'osucad-framework';

export interface EditorSafeAreaOptions {
  readonly totalSize: Vec2;
  readonly topInner: number;
  readonly bottomInner: number;
  readonly topLeft: Vec2;
  readonly topRight: Vec2;
  readonly bottomLeft: Vec2;
  readonly bottomRight: Vec2;
}

export class EditorSafeArea {
  constructor(
    options: EditorSafeAreaOptions,
  ) {
    const { totalSize, topInner, bottomInner, topLeft, topRight, bottomLeft, bottomRight } = options;

    this.totalSize = totalSize;
    this.topInner = topInner;
    this.bottomInner = bottomInner;
    this.topLeft = topLeft;
    this.topRight = topRight;
    this.bottomLeft = bottomLeft;
    this.bottomRight = bottomRight;
  }

  readonly totalSize: Vec2;
  readonly topInner: number;
  readonly bottomInner: number;
  readonly topLeft: Vec2;
  readonly topRight: Vec2;
  readonly bottomLeft: Vec2;
  readonly bottomRight: Vec2;

  static default = new EditorSafeArea({
    totalSize: new Vec2(1280, 720),
    topInner: 0,
    bottomInner: 0,
    topLeft: Vec2.zero(),
    bottomLeft: Vec2.zero(),
    topRight: Vec2.zero(),
    bottomRight: Vec2.zero(),
  });

  get top() {
    return Math.max(this.topLeft.y, this.topRight.y);
  }

  get bottom() {
    return Math.max(this.bottomLeft.y, this.bottomRight.y);
  }

  equals(other: EditorSafeArea) {
    return this.totalSize.equals(other.totalSize)
      && this.topLeft.equals(other.topLeft)
      && this.topRight.equals(other.topRight)
      && this.bottomLeft.equals(other.bottomLeft)
      && this.bottomRight.equals(other.bottomRight);
  }
}
