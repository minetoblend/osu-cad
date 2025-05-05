import { queue } from "async";
import type { MPEGDecodedAudio } from "mpg123-decoder";
import { MPEGDecoderWebWorker } from "mpg123-decoder";

export class Mp3Decoder
{
  private readonly decoders: MPEGDecoderWebWorker[] = [];

  private getDecoder()
  {
    return this.decoders.pop() ?? new MPEGDecoderWebWorker();
  }

  private returnDecoder(decoder: MPEGDecoderWebWorker)
  {
    this.decoders.push(decoder);
  }

  private readonly queue = queue(async (data: ArrayBuffer) =>
  {
    const decoder = this.getDecoder();
    try
    {
      await decoder.ready;

      const audioData = await decoder.decode(new Uint8Array(data));

      await decoder.reset();
      return audioData;
    }
    finally
    {
      this.returnDecoder(decoder);
    }
  }, 4);

  decode(data: ArrayBuffer): Promise<MPEGDecodedAudio>
  {
    return this.queue.push(data);
  }

  dispose()
  {
    this.decoders.forEach(it => it.free());
    this.decoders.length = 0;
  }
}
