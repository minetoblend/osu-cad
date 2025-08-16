import type { DocumentRuntime } from "../runtime/index.js";
import { nn } from "./nn.js";
import { Delta } from "../dds/index.js";
import type { IDocumentMessage } from "@osucad/multiplayer-protocol";
import { MessageType } from "@osucad/multiplayer-protocol";

export function syncRuntimes(runtime1: DocumentRuntime, runtime2: DocumentRuntime)
{
  runtime1.on("deltaSubmitted", (dds, delta) =>
  {
    const message: IDocumentMessage = {
      type: MessageType.Delta,
      deltas: [{ target: dds.id, content: delta.encode() }],
    };

    runtime1.process(message, true);
    runtime2.process(message, false);
  });

  runtime2.on("deltaSubmitted", (dds, delta) =>
  {
    const message: IDocumentMessage = {
      type: MessageType.Delta,
      deltas: [{ target: dds.id, content: delta.encode() }],
    };

    runtime1.process(message, false);
    runtime2.process(message, true);
  });

  runtime1.on("attached", (dds, summary) =>
  {
    const message: IDocumentMessage = {
      type: MessageType.Attach,
      content: [{ id: dds.id, summary }],
    };

    runtime1.process(message, true);
    runtime2.process(message, false);
  });

  runtime2.on("attached", (dds, summary) =>
  {
    const message: IDocumentMessage = {
      type: MessageType.Attach,
      content: [{ id: dds.id, summary }],
    };

    runtime1.process(message, false);
    runtime2.process(message, true);
  });
}
