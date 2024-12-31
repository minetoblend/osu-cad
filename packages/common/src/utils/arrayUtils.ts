export function* zipWithNext<T>(array: ReadonlyArray<T>): Generator<[T, T], void, undefined> {
  for (let i = 0; i < array.length - 1; i++) {
    yield [array[i], array[i + 1]];
  }
}

export function maxOf(array: ReadonlyArray<number>) {
  if (array.length === 0)
    throw new Error('Cannot compute max of emtpy array');

  let max = array[0];

  for (let i = 1; i < array.length; i++) {
    if (array[i] > max)
      max = array[i];
  }

  return max;
}

export function maxBy<T>(array: ReadonlyArray<T>, fn: (item: T, index: number, array: ReadonlyArray<T>) => number) {
  return maxOf(array.map(fn));
}
