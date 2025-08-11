import { AbstractBinaryDecoder } from "./AbstractBinaryDecoder.js";
import type { BinaryReader } from "./BinaryReader.js";
import type { ISparseObjectDecoder } from "../decoding/IDecoder.js";
import { BinarySparseObjectDecoder } from "./BinarySparseObjectDecoder.js";

export class BinaryDecoder extends AbstractBinaryDecoder
{
  constructor(reader: BinaryReader)
  {
    super(reader);
  }

  override decodeSparseObject<T>(decode: (size: number, decoder: ISparseObjectDecoder) => T): T
  {
    const decoder = new BinarySparseObjectDecoder(this.reader);

    const size = this.reader.readVarInt();

    return decode(size, decoder);
  }
}
