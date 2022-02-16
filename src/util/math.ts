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