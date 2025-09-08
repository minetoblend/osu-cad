import type { IEncodedDelta, IEncodedDeltas } from "@osucad/multiplayer-protocol";
import { DeltaCompressor } from "./DeltaCompressor.js";

export class DeltaDecompressor
{
  public decompress(message: IEncodedDeltas): IEncodedDelta[]
  {
    let content = message.content;

    if (message.symbols)
    {
      for (let i = 0; i < message.symbols.length; i++)
      {
        const placeholder = DeltaCompressor.encodeIndex(i);

        content = content.replaceAll(placeholder, `"${message.symbols[i]}"`);
      }
    }

    return JSON.parse(content);
  }
}
