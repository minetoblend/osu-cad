import * as uuid from "uuid";
import { BinaryReader } from "./BinaryReader.js";

export class BinaryWriter
{
  #data = new ArrayBuffer(1024);
  #view = new DataView(this.#data);
  #position = 0;

  get buffer()
  {
    return this.#data.slice(0, this.#position);
  }

  asReader()
  {
    return new BinaryReader(this.buffer);
  }

  #ensureSize(bytes: number)
  {
    const requiredSize = this.#position + bytes;

    if (requiredSize > this.#data.byteLength)
    {
      let newSize = this.#data.byteLength * 2;

      while (newSize < requiredSize)
        newSize *= 2;

      const data = new ArrayBuffer(newSize);
      new Uint8Array(data).set(new Uint8Array(this.#data));

      this.#data = data;
      this.#view = new DataView(data);
    }
  }

  writeUint8(value: number)
  {
    this.#ensureSize(1);
    this.#view.setUint8(this.#position, value);
    this.#position += 1;
    return this;
  }

  writeUint16(value: number)
  {
    this.#ensureSize(2);
    this.#view.setUint16(this.#position, value);
    this.#position += 2;
    return this;
  }

  writeUint32(value: number)
  {
    this.#ensureSize(4);
    this.#view.setUint32(this.#position, value);
    this.#position += 4;
    return this;
  }

  writeInt8(value: number)
  {
    this.#ensureSize(1);
    this.#view.setInt8(this.#position, value);
    this.#position += 1;
    return this;
  }

  writeInt16(value: number)
  {
    this.#ensureSize(2);
    this.#view.setInt16(this.#position, value);
    this.#position += 2;
    return this;
  }

  writeInt32(value: number)
  {
    this.#ensureSize(4);
    this.#view.setInt32(this.#position, value);
    this.#position += 4;
    return this;
  }

  writeVarInt(value: number)
  {
    value |= 0; // Infinity, -Infinity, NaN = 0
    do
    {
      let byte = value;
      value >>>= 7; // shift by 7 bits
      if (value)
        byte |= 0x80; // set continuation indicator bit
      this.writeUint8(byte & 0xFF);
    } while (value !== 0);

    return this;
  }

  writeFloat32(value: number)
  {
    this.#ensureSize(4);
    this.#view.setFloat32(this.#position, value);
    this.#position += 4;
    return this;
  }

  writeFloat64(value: number)
  {
    this.#ensureSize(8);
    this.#view.setFloat64(this.#position, value);
    this.#position += 8;
    return this;
  }

  writeBoolean(value: boolean)
  {
    this.writeUint8(value ? 1 : 0);
    return this;
  }

  writeBytes(bytes: Uint8Array)
  {
    this.#ensureSize(bytes.byteLength);
    new Uint8Array(this.#data).set(bytes, this.#position);
    this.#position += bytes.byteLength;
  }

  writeString(value: string)
  {
    const bytes = new TextEncoder().encode(value);
    this.writeVarInt(bytes.byteLength);
    this.writeBytes(bytes);
    return this;
  }

  writeUuid(value: string)
  {
    const bytes = uuid.parse(value);
    this.writeBytes(bytes);
  }
}
