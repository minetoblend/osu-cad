import type { BinaryWriter } from "./BinaryWriter";
import type { BinaryReader } from "./BinaryReader";

export interface Encoder<T>
{
  encode: (value: T, writer: BinaryWriter) => void
}


export interface Decoder<T>
{
  decode: (reader: BinaryReader) => T
}

export interface Serializer<T> extends Encoder<T>, Decoder<T>
{
  equals?: (a: T, b: T) => boolean
}
