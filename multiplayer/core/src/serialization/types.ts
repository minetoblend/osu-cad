import type { DDS } from "../dds/index.js";
import { nn } from "../utils/nn.js";
import { EventEmitter } from "eventemitter3";

export interface DDSRef
{
  $ref: string;
}

export interface IEncoder
{
  encodeDDS(dds: DDS): DDSRef;
}

export interface IDecoder
{
  decodeDDS(ref: DDSRef): DDS;
}

export interface EncoderEvents
{
  ddsEncoded(dds: DDS): void;
}

export class Encoder extends EventEmitter<EncoderEvents> implements IEncoder
{
  encodeDDS(dds: DDS): DDSRef
  {
    this.emit("ddsEncoded", dds);

    return { $ref: nn(dds.id) };
  }
}

export class Decoder implements IDecoder
{
  constructor(readonly ddsSource: { getObject(id: string): DDS | undefined } = { getObject: () => undefined })
  {
  }

  decodeDDS(ref: DDSRef): DDS
  {
    return nn(this.ddsSource.getObject(ref.$ref));
  }
}
