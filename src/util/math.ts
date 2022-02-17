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


}

export function clamp(value: number, min: number, max: number) {
    if (value < min)
        return min
    if (value > max)
        return max
    return value
}