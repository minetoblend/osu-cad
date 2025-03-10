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
  if (array.length === 0)
    throw new Error('Cannot compute max of emtpy array');

  let max = array[0];
  let maxValue = fn(array[0], 0, array);

  for (let i = 1; i < array.length; i++) {
    const value = fn(array[i], i, array);
    if (value > maxValue) {
      max = array[i];
      maxValue = value;
    }
  }

  return max;
}

export function minOf(array: ReadonlyArray<number>) {
  if (array.length === 0)
    throw new Error('Cannot compute max of emtpy array');

  let min = array[0];

  for (let i = 1; i < array.length; i++) {
    if (array[i] < min)
      min = array[i];
  }

  return min;
}

export function minBy<T>(array: ReadonlyArray<T>, fn: (item: T, index: number, array: ReadonlyArray<T>) => number) {
  if (array.length === 0)
    throw new Error('Cannot compute max of emtpy array');

  let min = array[0];
  let minValue = fn(array[0], 0, array);

  for (let i = 1; i < array.length; i++) {
    const value = fn(array[i], i, array);
    if (value < minValue)
      min = array[i];
    minValue = value;
  }

  return min;
}

export function sumOf(array: ReadonlyArray<number>) {
  return array.reduce((a, b) => a + b, 0);
}

export function sumBy<T>(array: ReadonlyArray<T>, fn: (item: T, index: number, array: ReadonlyArray<T>) => number) {
  return sumOf(array.map(fn));
}

export function avgOf(array: ReadonlyArray<number>) {
  return sumOf(array) / array.length;
}

export function avgBy<T>(array: ReadonlyArray<T>, fn: (item: T, index: number, array: ReadonlyArray<T>) => number) {
  return sumOf(array.map(fn)) / array.length;
}

export function arrayify<T>(itemOrArray: T | T[]): T[] {
  return Array.isArray(itemOrArray) ? itemOrArray : [itemOrArray];
}
