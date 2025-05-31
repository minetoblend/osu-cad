import { type IVec2, Vec2 } from "./Vec2";

export class Rectangle
{
  x: number;
  y: number;
  width: number;
  height: number;

  constructor(x: number, y: number, width: number, height: number)
  {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  get size()
  {
    return new Vec2(this.width, this.height);
  }

  get center(): Vec2
  {
    return new Vec2(this.x + this.width / 2, this.y + this.height / 2);
  }

  get left(): number
  {
    return this.x;
  }

  set left(value)
  {
    this.width -= value - this.x;
    this.x = value;
  }

  get right(): number
  {
    return this.x + this.width;
  }

  set right(value)
  {
    this.width = value - this.x;
  }

  get top(): number
  {
    return this.y;
  }

  set top(value)
  {
    this.height -= value - this.y;
    this.y = value;
  }

  get bottom(): number
  {
    return this.y + this.height;
  }

  set bottom(value)
  {
    this.height = value - this.y;
  }

  get topLeft(): Vec2
  {
    return new Vec2(this.left, this.top);
  }

  get topRight(): Vec2
  {
    return new Vec2(this.right, this.top);
  }

  get bottomLeft(): Vec2
  {
    return new Vec2(this.left, this.bottom);
  }

  get bottomRight(): Vec2
  {
    return new Vec2(this.right, this.bottom);
  }

  contains(point: IVec2)
  {
    return point.x >= this.left && point.x <= this.right && point.y >= this.top && point.y <= this.bottom;
  }

  equals(rect: Rectangle)
  {
    return this.x === rect.x && this.y === rect.y && this.width === rect.width && this.height === rect.height;
  }

  inflate(amount: number | Vec2)
  {
    if (typeof amount === "number")
      amount = new Vec2(amount, amount);

    this.x -= amount.x;
    this.y -= amount.y;
    this.width += amount.x * 2;
    this.height += amount.y * 2;

    return this;
  }

  inflated(amount: number)
  {
    return new Rectangle(this.x - amount, this.y - amount, this.width + amount * 2, this.height + amount * 2);
  }

  offset(x: number, y: number)
  {
    this.x += x;
    this.y += y;
  }
}
