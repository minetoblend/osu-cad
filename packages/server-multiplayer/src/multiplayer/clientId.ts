let currentId = 0;

export function nextClientId(): number {
  return ++currentId;
}
