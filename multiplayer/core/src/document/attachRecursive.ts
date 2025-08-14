import type { DocumentRuntime } from "../runtime/index.js";
import type { DDS } from "../dds/index.js";
import { Encoder } from "../serialization/index.js";

export function attachRecursive(runtime: DocumentRuntime, objects: DDS[])
{
  const encoder = new Encoder();
  encoder.on("ddsEncoded", other =>
  {
    if (runtime.attach(other))
      other.createSummary(encoder);
  });

  for (const object of objects)
  {
    runtime.attach(object);
    object.createSummary(encoder);
  }
}
