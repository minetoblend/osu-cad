export function difficultyRange(difficulty: number, min: number, mid: number, max: number) {

    if (difficulty > 5)
        return mid + (max - mid) * (difficulty - 5) / 5
    if (difficulty < 5)
        return mid - (mid - min) * (5 - difficulty) / 5
    return mid
}