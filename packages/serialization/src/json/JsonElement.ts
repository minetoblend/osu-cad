export type JsonElement =
  | JsonPrimitive
  | { [key: string]: JsonElement }
  | JsonElement[];

export type JsonPrimitive
  = null
  | boolean
  | number
  | string;
