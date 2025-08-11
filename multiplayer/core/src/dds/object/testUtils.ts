import type { ObjectDDS } from "./ObjectDDS.js";
import type { JsonElement } from "../../serialization/json/JsonElement.js";
import { JsonEncoder } from "../../serialization/json/JsonEncoder.js";
import { BinaryWriter } from "../../serialization/binary/BinaryWriter.js";
import { BinaryEncoder } from "../../serialization/binary/BinaryEncoder.js";
import type { ISerializationStrategy } from "../../serialization/types.js";

export function encodeToJson<T>(serializer: ISerializationStrategy<T>, value: T)
{
  let result: JsonElement = null;

  const encoder = new JsonEncoder(value => result = value);

  serializer.serialize(encoder, value);

  return result;
}

export function encodeToBinary<T>(serializer: ISerializationStrategy<T>, value: T): ArrayBuffer
{
  const writer = new BinaryWriter();

  const encoder = new BinaryEncoder(writer);

  serializer.serialize(encoder, value);

  return writer.buffer;
}


export function createJsonSummary(dds: ObjectDDS): JsonElement
{
  let result: JsonElement = null;

  const encoder = new JsonEncoder(value => result = value);

  dds.createSummary(encoder);

  return result;
}


export function createBinarySummary(dds: ObjectDDS): ArrayBuffer
{
  const writer= new BinaryWriter();

  const encoder = new BinaryEncoder(writer);

  dds.createSummary(encoder);

  return writer.buffer;
}
