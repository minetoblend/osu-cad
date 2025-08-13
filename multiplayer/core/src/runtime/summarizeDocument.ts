import type { DocumentRuntime } from "./DocumentRuntime.js";
import type { IDDSSummary, IDocumentSummary } from "@osucad/multiplayer-protocol";
import { Encoder } from "../serialization/types.js";
import type { DDS } from "../dds/index.js";
import { nn } from "../utils/nn.js";

export function summarizeDocument(runtime: DocumentRuntime): IDocumentSummary
{
  const remaining: DDS[] =[];
  const tracked = new Set([runtime.root]);

  const encoder = new Encoder();
  encoder.on("ddsEncoded", dds =>
  {
    if (!tracked.has(dds))
    {
      tracked.add(dds);
      remaining.push(dds);
    }
  });

  const entries: Record<string, IDDSSummary> = {};

  let current: DDS | undefined = runtime.root;

  while (current)
  {
    entries[nn(current.id)] = {
      attributes: current.attributes,
      content: current.createSummary(encoder),
    };

    current = remaining.pop();
  }

  return {
    types: [...runtime.typeRegistry.ddsFactories.values()].map(it => it.attributes),
    root: nn(runtime.root.id),
    entries,
  };
}
