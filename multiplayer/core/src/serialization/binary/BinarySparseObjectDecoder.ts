import type { ICompositeDecoder, ISparseObjectDecoder } from "../decoding/IDecoder.js";
import type { SerialDescriptor } from "../descriptor/SerialDescriptor.js";
import { AbstractBinaryDecoder } from "./AbstractBinaryDecoder.js";

export class BinarySparseObjectDecoder extends AbstractBinaryDecoder implements ISparseObjectDecoder
{
  decodeElementIndex(descriptor: SerialDescriptor): number
  {
    return this.reader.readVarInt();
  }

  decodeSparseObject<T>(decode: (size: number, decoder: ISparseObjectDecoder) => T): T
  {
    const decoder = new BinarySparseObjectDecoder(this.reader);

    const size = this.reader.readVarInt();

    return decode(size, decoder);
  }
}
