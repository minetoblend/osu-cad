export type JsonElement =
  | JsonPrimitive
  | Record<string, JsonElement>
  | Array<JsonElement>;

export type JsonPrimitive
  = null
  | boolean
  | number
  | string;
