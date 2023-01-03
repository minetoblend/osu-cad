export function formatTimestamp(timestamp: number): string {
    const minutes = Math.floor(timestamp / 60_000);
    const seconds = Math.floor((timestamp / 1000) % 60);
    const milliseconds = Math.floor(timestamp % 1000);

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;

}
