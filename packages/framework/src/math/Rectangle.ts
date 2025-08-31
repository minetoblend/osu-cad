import { type IVec2, Vec2 } from "./Vec2";

export class Rectangle
{
  public x: number;
  public y: number;
  public width: number;
  public height: number;

  public constructor(x: number, y: number, width: number, height: number)
  {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  public get size()
  {
    return new Vec2(this.width, this.height);
  }

  public get center(): Vec2
  {
    return new Vec2(this.x + this.width / 2, this.y + this.height / 2);
  }

  public get left(): number
  {
    return this.x;
  }

  public set left(value)
  {
    this.width -= value - this.x;
    this.x = value;
  }

  public get right(): number
  {
    return this.x + this.width;
  }

  public set right(value)
  {
    this.width = value - this.x;
  }

  public get top(): number
  {
    return this.y;
  }

  public set top(value)
  {
    this.height -= value - this.y;
    this.y = value;
  }

  public get bottom(): number
  {
    return this.y + this.height;
  }

  public set bottom(value)
  {
    this.height = value - this.y;
  }

  public get topLeft(): Vec2
  {
    return new Vec2(this.left, this.top);
  }

  public get topRight(): Vec2
  {
    return new Vec2(this.right, this.top);
  }

  public get bottomLeft(): Vec2
  {
    return new Vec2(this.left, this.bottom);
  }

  public get bottomRight(): Vec2
  {
    return new Vec2(this.right, this.bottom);
  }

  public contains(point: IVec2)
  {
    return point.x >= this.left && point.x <= this.right && point.y >= this.top && point.y <= this.bottom;
  }

  public equals(rect: Rectangle)
  {
    return this.x === rect.x && this.y === rect.y && this.width === rect.width && this.height === rect.height;
  }

  public inflate(amount: number | Vec2)
  {
    if (typeof amount === "number")
      amount = new Vec2(amount, amount);

    this.x -= amount.x;
    this.y -= amount.y;
    this.width += amount.x * 2;
    this.height += amount.y * 2;

    return this;
  }

  public inflated(amount: number)
  {
    return new Rectangle(this.x - amount, this.y - amount, this.width + amount * 2, this.height + amount * 2);
  }

  public offset(x: number, y: number)
  {
    this.x += x;
    this.y += y;

    return this;
  }

  public clone()
  {
    const { x, y, width, height } = this;

    return new Rectangle(x, y, width, height);
  }

  public withOffset(x: number, y: number)
  {
    return this.clone().offset(x, y);
  }
}
