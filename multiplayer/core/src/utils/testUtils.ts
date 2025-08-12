import type { DocumentRuntime } from "../runtime/index.js";
import { nn } from "./nn.js";
import { Delta } from "../dds/index.js";

export function syncRuntimes(runtime1: DocumentRuntime, runtime2: DocumentRuntime)
{
  runtime1.on("deltaSubmitted", (dds, delta) =>
  {
    runtime1.process(nn(dds.id), Delta.encode(delta), true);
    runtime2.process(nn(dds.id), Delta.encode(delta), false);
  });

  runtime2.on("deltaSubmitted", (dds, delta) =>
  {
    runtime1.process(nn(dds.id), Delta.encode(delta), false);
    runtime2.process(nn(dds.id), Delta.encode(delta), true);
  });
}
