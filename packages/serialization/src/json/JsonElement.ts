export type JsonElement =
  | null
  | boolean
  | number
  | string
  | Record<string, JsonElement>
  | Array<JsonElement>;
