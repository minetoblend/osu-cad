export function binarySearch<T>(
  needle: number,
  haystack: T[],
  compareBy: (item: T) => number,
): { index: number, found: boolean } {
  let low = 0;
  let high = haystack.length - 1;

  while (low <= high) {
    const mid = (low + high) >>> 1;
    const midValue = compareBy(haystack[mid]);

    if (midValue < needle) {
      low = mid + 1;
    } else if (midValue > needle) {
      high = mid - 1;
    } else {
      return { index: mid, found: true };
    }
  }

  return { index: low, found: false };
}