import type { DDSAttributes } from "./DDSAttributes.js";
import type { IEncoder } from "../serialization/encoding/IEncoder.js";
import type { IDecoder } from "../serialization/decoding/IDecoder.js";

export abstract class DDS
{
  protected constructor(readonly attributes: DDSAttributes)
  {
  }

  get id(): string | null
  {
    // TODO
    return null;
  }

  abstract createSummary(encoder: IEncoder): unknown;

  abstract load(decoder: IDecoder, version: number): void;
}
