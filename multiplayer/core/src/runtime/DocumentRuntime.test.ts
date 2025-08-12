import { describe, it, expect } from "vitest";
import type { DDSAttributes } from "../dds/index.js";
import { type } from "../dds/index.js";
import { ObjectDDS } from "../dds/index.js";
import { DocumentRuntime } from "./DocumentRuntime.js";

describe("DocumentRuntime", () =>
{
  it("creates and loads summaries", () =>
  {
    class Foo extends ObjectDDS
    {
      static attributes: DDSAttributes = { type: "foo", version: 0 };

      constructor()
      {
        super(Foo.attributes);
      }

      @type("int32") accessor count = 0;
    }

    const foo = new Foo();
    const runtime = DocumentRuntime.create(foo, [Foo]);

    foo.count = 10;

    const runtime2 = new DocumentRuntime([Foo]);

    runtime2.load(runtime.createSummary());

    expect(runtime2.root).toBeInstanceOf(Foo);
    const foo2 = runtime2.root as Foo;

    expect(foo2).not.toBe(foo);

    expect(foo2.count).toBe(10);

    runtime.on("deltaSubmitted", ({ id }, delta) => runtime2.replayDelta(id!, delta));

    foo.count = 20;
    expect(foo2.count).toBe(20);
  });

  it("validates required types", () =>
  {
    class Foo extends ObjectDDS
    {
      static attributes: DDSAttributes = { type: "foo", version: 0 };

      constructor()
      {
        super(Foo.attributes);
      }
    }

    class Bar extends ObjectDDS
    {
      static attributes: DDSAttributes = { type: "bar", version: 0 };

      constructor()
      {
        super(Bar.attributes);
      }
    }

    const runtime1 = DocumentRuntime.create(new Foo(), [Foo, Bar]);
    const runtime2 = new DocumentRuntime([Foo]);
    const runtime3 = new DocumentRuntime([Foo, Bar]);

    expect(() => runtime2.load(runtime1.createSummary())).toThrow();
    expect(() => runtime3.load(runtime1.createSummary())).not.toThrow();
  });
});
