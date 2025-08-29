import type { ILerp } from "../../types/ILerp";
import { lerp } from "../../math/lerp";
import { Vec2 } from "../../math/Vec2";

export type MarginPaddingOptions = number | (MarginPaddingOptionsHorizontal & MarginPaddingOptionsVertical);

export type MarginPaddingOptionsHorizontal =
  | {
    left?: number;
    right?: number;
  }
  | { horizontal: number };

export type MarginPaddingOptionsVertical =
  | {
    top?: number;
    bottom?: number;
  }
  | { vertical: number };

export class MarginPadding implements ILerp<MarginPadding>
{
  public readonly left: number;
  public readonly right: number;
  public readonly top: number;
  public readonly bottom: number;

  public static readonly Default = new MarginPadding();

  public constructor(options?: MarginPaddingOptions)
  {
    if (typeof options === "number")
    {
      this.left = this.right = this.top = this.bottom = options;
    }
    else if (options)
    {
      if ("horizontal" in options)
      {
        this.left = this.right = options.horizontal;
      }
      else
      {
        this.left = options.left ?? 0;
        this.right = options.right ?? 0;
      }

      if ("vertical" in options)
      {
        this.top = this.bottom = options.vertical;
      }
      else
      {
        this.top = options.top ?? 0;
        this.bottom = options.bottom ?? 0;
      }
    }
    else
    {
      this.left = this.right = this.top = this.bottom = 0;
    }
  }

  public get totalHorizontal()
  {
    return this.left + this.right;
  }

  public get totalVertical()
  {
    return this.top + this.bottom;
  }

  #total: Vec2 | null = null;

  public get total(): Vec2
  {
    this.#total ??= new Vec2(this.totalHorizontal, this.totalVertical);
    return this.#total;
  }

  public lerp(target: MarginPadding, t: number): MarginPadding
  {
    return new MarginPadding({
      left: lerp(this.left, target.left, t),
      right: lerp(this.right, target.right, t),
      top: lerp(this.top, target.top, t),
      bottom: lerp(this.bottom, target.bottom, t),
    });
  }

  public clone(): MarginPadding
  {
    return new MarginPadding({
      left: this.left,
      right: this.right,
      top: this.top,
      bottom: this.bottom,
    });
  }

  public equals(other: MarginPadding): boolean
  {
    return (
      this.left === other.left && this.right === other.right && this.top === other.top && this.bottom === other.bottom
    );
  }

  public isZero(): boolean
  {
    return this.left === 0 && this.right === 0 && this.top === 0 && this.bottom === 0;
  }

  public toString(): string
  {
    return `MarginPadding(${this.left}, ${this.right}, ${this.top}, ${this.bottom})`;
  }

  public static from(options?: MarginPadding | MarginPaddingOptions): MarginPadding
  {
    if (options instanceof MarginPadding)
    {
      return options;
    }
    return new MarginPadding(options);
  }
}
