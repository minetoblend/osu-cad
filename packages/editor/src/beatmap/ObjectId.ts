export type ObjectId = string;

export function objectId() {
  return Math.random().toString(36).slice(2);
}
