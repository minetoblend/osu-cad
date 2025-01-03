export function trimIndent(str: string) {
  return str.split('\n')
    .map(it => it.trim())
    .join('\n')
    .trim();
}
