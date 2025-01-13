export class Timer {
  total = 0;

  start() {
    return performance.now();
  }

  stop(start: number) {
    this.total += performance.now() - start;
  }

  clear() {
    this.total = 0;
  }

  measure<T>(fn: () => T): T {
    const start = this.start();

    try {
      return fn();
    }
    finally {
      this.stop(start);
    }
  }
}
