export class Vec2 {

  x: number
  y: number

  constructor(x: number = 0, y?: number) {
    this.x = x
    if (y === undefined) {
      // noinspection JSSuspiciousNameCombination
      this.y = x
    } else
      this.y = y
  }


  serialize() {
    return {
      x: this.x,
      y: this.y
    }
  }

  clone() {
    return new Vec2(this.x, this.y)
  }

  distanceTo(rhs: Vec2) {
    return Math.hypot(
      this.x - rhs.x,
      this.y - rhs.y,
    )
  }
}

export function clamp(value: number, min: number, max: number) {
  if (value < min)
    return min
  if (value > max)
    return max
  return value
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}