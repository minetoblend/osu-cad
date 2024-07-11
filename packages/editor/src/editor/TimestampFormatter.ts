export class TimestampFormatter {
  static formatTimestamp(timestamp: number): string {
    timestamp = Math.floor(timestamp);

    const minutes = Math.floor(timestamp / 60000);
    const seconds = Math.floor((timestamp % 60000) / 1000);
    const milliseconds = Math.floor((timestamp % 1000) / 10);

    return [
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0'),
      milliseconds.toString().padStart(3, '0'),
    ].join(':');
  }
}
