export class Vec2 {
    constructor(public x: number, public y: number) {
        this.x = x
        this.y = y
    }

    static get zero() {
        return new Vec2(0, 0)
    }

    static get one() {
        return new Vec2(1, 1)
    }

    static get up() {
        return new Vec2(0, 1)
    }

    static get down() {
        return new Vec2(0, -1)
    }

    static get left() {
        return new Vec2(-1, 0)
    }

    static get right() {
        return new Vec2(1, 0)
    }

    get length() {
        return Math.hypot(this.x, this.y)
    }

    get lengthSquared() {
        return this.x * this.x + this.y * this.y
    }

    get normalized() {
        return this.divF(this.length)
    }

    get angle() {
        return Math.atan2(this.y, this.x)
    }

    add(other: Vec2) {
        return new Vec2(this.x + other.x, this.y + other.y)
    }

    sub(other: Vec2) {
        return new Vec2(this.x - other.x, this.y - other.y)
    }

    mul(other: Vec2) {
        return new Vec2(this.x * other.x, this.y * other.y)
    }

    div(other: Vec2) {
        return new Vec2(this.x / other.x, this.y / other.y)
    }

    addF(other: number) {
        return new Vec2(this.x + other, this.y + other)
    }

    subF(other: number) {
        return new Vec2(this.x - other, this.y - other)
    }

    mulF(other: number) {
        return new Vec2(this.x * other, this.y * other)
    }

    divF(other: number) {
        return new Vec2(this.x / other, this.y / other)
    }

    normalize() {
        const len = this.length

        console.assert(len !== 0, 'Cannot normalize a zero vector')

        return this.divF(len)
    }

    rotate(angle: number) {
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        return new Vec2(
            this.x * cos - this.y * sin,
            this.x * sin + this.y * cos
        )
    }

    rotateAround(angle: number, origin: Vec2) {
        return this.sub(origin).rotate(angle).add(origin)
    }

    dot(other: Vec2) {
        return this.x * other.x + this.y * other.y
    }

    cross(other: Vec2) {
        return this.x * other.y - this.y * other.x
    }

    lerp(other: Vec2, t: number) {
        return new Vec2(
            this.x + (other.x - this.x) * t,
            this.y + (other.y - this.y) * t
        )
    }

    distanceTo(other: Vec2) {
        return other.sub(this).length
    }

    distanceToSquared(other: Vec2) {
        return other.sub(this).lengthSquared
    }

    equals(other: Vec2) {
        return this.x === other.x && this.y === other.y
    }


    angleTo(other: Vec2) {
        return Math.atan2(this.cross(other), this.dot(other))
    }

    toString() {
        return `(${this.x}, ${this.y})`
    }

    toArray() {
        return [this.x, this.y]
    }

    negate() {
        return new Vec2(-this.x, -this.y)
    }

    round() {
        return new Vec2(Math.round(this.x), Math.round(this.y))
    }
}
