import type { BlobHandle } from "../blobs/BlobManager.js";
import type { DDS } from "../dds/index.js";
import { nn } from "../utils/nn.js";
import { EventEmitter } from "eventemitter3";
import { assert } from "../utils/assert.js";
import type { DocumentRuntime } from "../runtime/DocumentRuntime.js";

export interface DDSRef
{
  type: "__dds__"
  id: string;
}

export interface BlobRef
{
  type: "__blob__"
  id: string;
}

export interface IEncoder
{
  encodeDDS(dds: DDS): DDSRef;

  encodeBlob(blob: BlobHandle): BlobRef
}

export interface IDecoder
{
  decodeDDS(ref: DDSRef): DDS | undefined;

  decodeBlob(ref: BlobRef): BlobHandle;
}

export interface EncoderEvents
{
  ddsEncoded(dds: DDS): void;
  blobEncoded(blob: BlobHandle): void;
}

export class Encoder extends EventEmitter<EncoderEvents> implements IEncoder
{
  public encodeDDS(dds: DDS): DDSRef
  {
    this.emit("ddsEncoded", dds);

    return {
      type: "__dds__",
      id: nn(dds.id),
    };
  }

  public encodeBlob(blob: BlobHandle): BlobRef
  {
    return {
      type: "__blob__",
      id: blob.id,
    };
  }
}

export class Decoder implements IDecoder
{
  public constructor(public readonly runtime?: DocumentRuntime)
  {
  }

  public decodeDDS(ref: DDSRef): DDS | undefined
  {
    assert(ref.type === "__dds__", "Not a valid dds handle");
    return this.runtime!.objects.getObject(ref.id);
  }

  public decodeBlob(ref: BlobRef): BlobHandle
  {
    assert(ref.type === "__blob__", "Not a valid blob handle");

    return nn(this.runtime!.getBlobHandle(ref.id), `Blob ${ref.id} not found`);
  }
}
