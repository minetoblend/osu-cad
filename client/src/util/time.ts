export function formatTimestamp(milliseconds: number) {
    return [
        Math.floor(milliseconds / 60_000).toString().padStart(2, '0'),
        Math.floor((milliseconds / 1000) % 60).toString().padStart(2, '0'),
        Math.floor(milliseconds % 1000).toString().padStart(3, '0')
    ].join(':')
}