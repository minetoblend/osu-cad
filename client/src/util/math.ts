export function lerp(a: number, b: number, f: number) {
    return a + (b - a) * f
}

export interface IHasMathOperations<T> {
    clone(): T

    add(rhs: T): T

    sub(rhs: T): T

    mul(rhs: T): T

    div(rhs: T): T

    addF(rhs: number): T

    subF(rhs: number): T

    mulF(rhs: number): T

    divF(rhs: number): T

    lerp(rhs: T, f: number): T

    equals(rhs: T): boolean
}

export class Float implements IHasMathOperations<Float> {

    constructor(public value: number) {
    }

    add(rhs: Float): Float {
        return new Float(this.value + rhs.value);
    }

    addF(rhs: number): Float {
        return new Float(this.value - rhs);
    }

    div(rhs: Float): Float {
        return new Float(this.value / rhs.value);
    }

    divF(rhs: number): Float {
        return new Float(this.value / rhs);
    }

    mul(rhs: Float): Float {
        return new Float(this.value * rhs.value);
    }

    mulF(rhs: number): Float {
        return new Float(this.value * rhs);
    }

    sub(rhs: Float): Float {
        return new Float(this.value - rhs.value);
    }

    subF(rhs: number): Float {
        return new Float(this.value - rhs);
    }

    lerp(rhs: Float, f: number): Float {
        return new Float(this.value + (rhs.value - this.value) * f)
    }

    clone() {
        return new Float(this.value)
    }

    equals(rhs: Float): boolean {
        return this.value === rhs.value;
    }
}

export class Vec2 implements IHasMathOperations<Vec2> {
    constructor(public x: number = 0, public y: number = x) {

    }

    get length() {
        return Math.hypot(this.x, this.y)
    }

    get lengthSquared() {
        return this.x * this.x + this.y * this.y;
    }

    get normalized() {
        const l = this.length
        return this.divF(l)
    }

    static zero() {
        return new Vec2();
    }

    static one() {
        return new Vec2(1, 1);
    }

    static playfieldCentre() {
        return new Vec2(320, 240)
    }

    clone() {
        return new Vec2(this.x, this.y)
    }

    add({x, y}: Vec2) {
        return new Vec2(this.x + x, this.y + y)
    }

    sub({x, y}: Vec2) {
        return new Vec2(this.x - x, this.y - y)
    }

    mul({x, y}: Vec2) {
        return new Vec2(this.x * x, this.y * y)
    }

    div({x, y}: Vec2) {
        return new Vec2(this.x / x, this.y / y)
    }

    addF(f: number) {
        return new Vec2(this.x + f, this.y + f)
    }

    subF(f: number) {
        return new Vec2(this.x - f, this.y - f)
    }

    mulF(f: number) {
        return new Vec2(this.x * f, this.y * f)
    }

    divF(f: number) {
        return new Vec2(this.x / f, this.y / f)
    }

    rotate(angle: number) {
        const cs = Math.cos(angle)
        const sn = Math.sin(angle)
        return new Vec2(
            this.x * cs - this.y * sn,
            this.x * sn + this.y * cs,
        )
    }

    rotateDeg(angle: number) {
        const cs = Math.cos(angle / 180 * Math.PI)
        const sn = Math.sin(angle / 180 * Math.PI)
        return new Vec2(
            this.x * cs - this.y * sn,
            this.x * sn + this.y * cs,
        )
    }

    rotateCcw() {
        return new Vec2(
            -this.y,
            this.x
        )
    }

    rotateCw() {
        return new Vec2(
            this.y,
            -this.x
        )
    }


    withX(x: number) {
        return new Vec2(x, this.y)
    }

    withY(y: number) {
        return new Vec2(this.x, y)
    }

    lerp({x, y}: Vec2, f: number) {
        return new Vec2(
            this.x + (x - this.x) * f,
            this.y + (y - this.y) * f
        )
    }

    set(x: number | Vec2, y?: number) {
        if (x instanceof Vec2) {
            this.x = x.x
            this.y = x.y
        } else {
            this.x = x
            this.y = y ?? this.y
        }
    }

    move(rhs: Vec2) {
        this.x += rhs.x
        this.y += rhs.y
    }

    min({x, y}: Vec2): Vec2 {
        return new Vec2(
            Math.min(this.x, x),
            Math.min(this.y, y),
        )
    }

    max({x, y}: Vec2): Vec2 {
        return new Vec2(
            Math.max(this.x, x),
            Math.max(this.y, y),
        )
    }

    toString() {
        return `(${this.x}, ${this.y})`
    }

    static from(from: Vec2Like) {
        return new Vec2(from.x, from.y)
    }

    static fromOpt(from?: Vec2Like): Vec2 | undefined {
        if (!from)
            return undefined
        return new Vec2(from.x, from.y)
    }

    equals(rhs: Vec2) {
        if (!rhs)
            return false
        return this.x === rhs.x && this.y === rhs.y
    }

    get angle() {
        return Math.atan2(this.y, this.x)
    }

    directionTo(to: Vec2) {
        const dx = to.x - this.x
        const dy = to.y - this.y
        const length = Math.hypot(dx, dy)
        return new Vec2(
            dx / length,
            dy / length
        )
    }

    angleTo(to: Vec2) {
        return Math.atan2(to.y - this.y, to.x - this.x)
    }

    static dot(a: Vec2, b: Vec2) {
        return a.x * b.x + a.y * b.y
    }

    rotateAround(center: Vec2, angle: number) {
        return this.sub(center).rotate(angle).add(center)
    }
}

export class Line {
    constructor(public from: Vec2, public to: Vec2) {
    }

    get length() {
        return this.from.sub(this.to).length
    }

    get angle() {
        let dir = this.to.sub(this.from).normalized
        return Math.atan2(
            dir.y,
            dir.x
        )
    }
}

export function getTangentsOf2Circles(center1: Vec2, rad1: number, center2: Vec2, rad2: number) {
    const ans: Line[] = []

    let d_sq = center1.sub(center2).lengthSquared;
    if (d_sq <= (rad1 - rad2) * (rad1 - rad2)) return [];

    const d = Math.sqrt(d_sq);
    let v = center2.sub(center1).divF(d)


    for (let sign1 = +1; sign1 >= -1; sign1 -= 2) {
        let c = (rad1 - sign1 * rad2) / d;
        if (c * c > 1.0) continue;
        const h = Math.sqrt(Math.max(0.0, 1.0 - c * c));

        for (let sign2 = +1; sign2 >= -1; sign2 -= 2) {
            const nx = v.x * c - sign2 * h * v.y;
            const ny = v.y * c + sign2 * h * v.x;

            ans.push(new Line(
                new Vec2(center1.x + rad1 * nx,
                    center1.y + rad1 * ny),
                new Vec2(
                    center2.x + sign1 * rad2 * nx,
                    center2.y + sign1 * rad2 * ny
                )
            ))

        }
    }

    return ans
}

export class Color implements IHasMathOperations<Color> {
    constructor(public r: number, public g: number, public b: number) {
    }

    static get white(): Color {
        return new Color(1, 1, 1);
    }

    static get black(): Color {
        return new Color(0, 0, 0);
    }

    static get red(): Color {
        return new Color(1, 0, 0);
    }

    static get green(): Color {
        return new Color(0, 1, 0);
    }

    static get blue(): Color {
        return new Color(0, 0, 1);
    }


    get hex() {
        let r = clamp(this.r, 0, 1) * 255
        let g = clamp(this.g, 0, 1) * 255
        let b = clamp(this.b, 0, 1) * 255
        return (r << 16) | (g << 8) | b
    }

    get rgb() {
        return `rgb(${this.r * 255},${this.g * 255},${this.b * 255})`
    }

    rgba(alpha: number) {
        return `rgba(${this.r * 255},${this.g * 255},${this.b * 255},${alpha})`
    }

    get grayscale() {
        const avg = (this.r + this.g + this.b) / 3
        return new Color(avg, avg, avg)
    }

    add(rhs: Color): Color {
        return new Color(this.r + rhs.r, this.g + rhs.g, this.b + rhs.b);
    }

    addF(rhs: number): Color {
        return new Color(this.r + rhs, this.g + rhs, this.b + rhs);
    }

    clone(): Color {
        return new Color(this.r, this.g, this.b);
    }

    div(rhs: Color): Color {
        return new Color(this.r / rhs.r, this.g / rhs.g, this.b / rhs.b);
    }

    divF(rhs: number): Color {
        return new Color(this.r / rhs, this.g / rhs, this.b / rhs);
    }

    lerp(rhs: Color, f: number): Color {
        return new Color(
            this.r + (rhs.r - this.r) * f,
            this.g + (rhs.g - this.g) * f,
            this.b + (rhs.b - this.b) * f,
        );
    }

    mul(rhs: Color): Color {
        return new Color(this.r * rhs.r, this.g * rhs.g, this.b * rhs.b);
    }

    mulF(rhs: number): Color {
        return new Color(this.r * rhs, this.g * rhs, this.b * rhs);
    }

    sub(rhs: Color): Color {
        return new Color(this.r - rhs.r, this.g - rhs.g, this.b - rhs.b);
    }

    subF(rhs: number): Color {
        return new Color(this.r - rhs, this.g - rhs, this.b - rhs);
    }

    equals(rhs: Color): boolean {
        return this.r === rhs.r && this.g === rhs.g && this.b === rhs.b;
    }
}

export interface Vec2Like {
    x: number
    y: number
}

export function clamp(value: number, min: number, max: number) {
    if (value < min)
        return min;
    if (value > max)
        return max;
    return value;
}

export class VectorMath {

    static distance(x1: number, y1: number, x2: number, y2: number) {
        return Math.hypot(x1 - x2, y1 - y2)
    }

    static distanceSquared(x1: number, y1: number, x2: number, y2: number) {
        x1 -= x2
        y1 -= y2
        return x1 * x1 + y1 * y1
    }

    static angle(x: number, y: number) {
        return Math.atan2(y, x)
    }

    static angle2(x1: number, y1: number, x2: number, y2: number) {
        return Math.atan2(y2 - y2, x2 - x1)
    }
}