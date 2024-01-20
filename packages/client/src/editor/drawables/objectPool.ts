export class ObjectPool<T> {
  private readonly pool: T[] = [];

  constructor(private readonly create: () => T, private readonly max = 20, private readonly destroy?: (obj: T) => void) {
  }

  get() {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    } else {
      return this.create();
    }
  }

  release(obj: T) {
    this.pool.push(obj);
    if (this.pool.length > this.max) {
      const obj = this.pool.shift()!;
      this.destroy?.(obj);
    }
  }
}