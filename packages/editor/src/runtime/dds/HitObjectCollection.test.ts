import { HitObject } from "@osucad/core";
import { DocumentRuntime, syncRuntimes, type DDSAttributes } from "@osucad/multiplayer-core";
import { inspect } from "node:util";
import { describe, expect, it } from "vitest";
import { HitObjectCollection } from "./HitObjectCollection";

describe("HitObjectCollection", () =>
{
  it("works", async () =>
  {
    class TestHitObject extends HitObject
    {
      static readonly attributes: DDSAttributes = {
        type: "test",
        version: 0,
      };

      constructor()
      {
        super(TestHitObject.attributes);
      }
    }

    const runtime1 = DocumentRuntime.create(new HitObjectCollection(), [HitObjectCollection, TestHitObject]);
    const runtime2 = await DocumentRuntime.load(runtime1.createSummary(), [HitObjectCollection, TestHitObject]);

    runtime1.on("attached", (dds, summary) =>
    {
      console.log("attach", dds.id, inspect(summary, { depth: 4 }));
    });
    runtime1.on("deltaSubmitted", (dds, delta) =>
    {
      console.log("delta", inspect({ target: dds.id, content: delta.encode() }, { depth: 4 }));
    });

    const hitObjects1 = runtime1.root;
    const hitObjects2 = runtime2.root as HitObjectCollection;

    syncRuntimes(runtime1, runtime2);

    hitObjects1.add(new TestHitObject());

    expect(hitObjects1.length).toBe(1);
    expect(hitObjects2.length).toBe(1);

    expect(hitObjects1.hitObjects[0].startTime).toBe(0);
    expect(hitObjects2.hitObjects[0]).toBeInstanceOf(TestHitObject);

    hitObjects1.hitObjects[0].startTime = 10;

    expect(hitObjects2.hitObjects[0].startTime).toBe(10);
    expect(hitObjects2.hitObjects[0].startTimeBindable.value).toBe(10);

    hitObjects2.hitObjects[0].startTime = 20;

    expect(hitObjects1.hitObjects[0].startTime).toBe(20);
    expect(hitObjects1.hitObjects[0].startTimeBindable.value).toBe(20);

    hitObjects2.remove(hitObjects2.hitObjects[0]);

    expect(hitObjects1.length).toBe(0);
    expect(hitObjects2.length).toBe(0);
  });
});
