let idCounter = 1

export function uniqueId(): number {
    return idCounter++
}
