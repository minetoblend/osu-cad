import * as uuid from "uuid";

export class BinaryReader
{
  readonly #buffer: ArrayBuffer;
  readonly #view: DataView;
  #position = 0;

  constructor(buffer: ArrayBuffer)
  {
    this.#buffer = buffer;
    this.#view = new DataView(buffer);
  }

  get length()
  {
    return this.#buffer.byteLength;
  }

  get remaining()
  {
    return this.length - this.#position;
  }

  #ensureSize(bytes: number)
  {
    if (bytes > this.remaining)
      throw new Error(`Cannot read ${bytes} bytes`);
  }

  skip(bytes: number)
  {
    this.#ensureSize(bytes);
    this.#position += bytes;
  }

  readUint8()
  {
    this.#ensureSize(1);
    const result = this.#view.getUint8(this.#position);
    this.#position += 1;
    return result;
  }

  readUint16()
  {
    this.#ensureSize(2);
    const result = this.#view.getUint16(this.#position);
    this.#position += 2;
    return result;
  }

  readUint32()
  {
    this.#ensureSize(4);
    const result = this.#view.getUint32(this.#position);
    this.#position += 4;
    return result;
  }

  readInt8()
  {
    this.#ensureSize(1);
    const result = this.#view.getInt8(this.#position);
    this.#position += 1;
    return result;
  }

  readInt16()
  {
    this.#ensureSize(2);
    const result = this.#view.getInt16(this.#position);
    this.#position += 2;
    return result;
  }

  readInt32()
  {
    this.#ensureSize(4);
    const result = this.#view.getInt32(this.#position);
    this.#position += 4;
    return result;
  }

  readVarInt()
  {
    let value = 0, shift = 0;

    let byte = this.readUint8();
    while (byte & 0x80)
    {
      value |= (byte & 0x7f) << shift;
      shift += 7;

      byte = this.readUint8();
    }
    value |= (byte & 0x7f) << shift;
    return value;
  }

  readFloat32()
  {
    this.#ensureSize(4);
    const result = this.#view.getFloat32(this.#position);
    this.#position += 4;
    return result;
  }

  readFloat64()
  {
    this.#ensureSize(8);
    const result = this.#view.getFloat64(this.#position);
    this.#position += 8;
    return result;
  }

  readBoolean()
  {
    return this.readUint8() !== 0;
  }

  readBytes(bytes: number)
  {
    this.#ensureSize(bytes);
    const result = new Uint8Array(this.#buffer, this.#position, bytes);
    this.#position += bytes;
    return result;
  }

  readString()
  {
    const size = this.readVarInt();
    this.#ensureSize(size);
    const bytes = this.readBytes(size);
    return new TextDecoder().decode(bytes);
  }

  readUuid()
  {
    return uuid.stringify(this.readBytes(16));
  }
}
