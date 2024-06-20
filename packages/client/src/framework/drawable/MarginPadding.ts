export class MarginPadding {
  readonly left: number = 0;
  readonly right: number = 0;
  readonly top: number = 0;
  readonly bottom: number = 0;

  get horizontal(): number {
    return this.left + this.right;
  }

  get vertical(): number {
    return this.top + this.bottom;
  }

  get isZero() {
    return (
      this.left === 0 && this.right === 0 && this.top === 0 && this.bottom === 0
    );
  }

  constructor(
    options:
      | number
      | {
          left?: number;
          right?: number;
          top?: number;
          bottom?: number;
          horizontal?: number;
          vertical?: number;
        } = {},
  ) {
    if (typeof options === 'number') {
      this.left = options;
      this.right = options;
      this.top = options;
      this.bottom = options;
    } else {
      this.left = options.left ?? 0;
      this.right = options.right ?? 0;
      this.top = options.top ?? 0;
      this.bottom = options.bottom ?? 0;

      if (options.horizontal !== undefined) {
        this.left = options.horizontal;
        this.right = options.horizontal;
      }

      if (options.vertical !== undefined) {
        this.top = options.vertical;
        this.bottom = options.vertical;
      }
    }
  }

  static default() {
    return new MarginPadding(0);
  }
}
