import { describe, expect, it } from "vitest";
import type { DDSAttributes } from "../dds/index.js";
import { nested, ObjectDDS, type } from "../dds/index.js";
import { DocumentRuntime } from "./DocumentRuntime.js";
import { nn } from "../utils/nn.js";
import { Delta } from "../dds/Delta.js";

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

    const runtime2 = DocumentRuntime.load(runtime.createSummary(), [Foo]);

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

    const runtime = DocumentRuntime.create(new Foo(), [Foo, Bar]);

    expect(() => DocumentRuntime.load(runtime.createSummary(), [Foo])).toThrow();
    expect(() => DocumentRuntime.load(runtime.createSummary(), [Foo, Bar])).not.toThrow();
  });

  it("processes encoded deltas", () =>
  {
    class Foo extends ObjectDDS
    {
      static attributes: DDSAttributes = { type: "foo", version: 0 };

      constructor()
      {
        super(Foo.attributes);
      }

      @type("int32")
      accessor count = 0

      @nested(() => Foo, { nullable: true })
      accessor foo: Foo | null = null
    }

    const foo1 = new Foo();

    const runtime1 = DocumentRuntime.create(foo1, [Foo]);
    const runtime2 = DocumentRuntime.load(runtime1.createSummary(), [Foo]);

    const foo2 = runtime2.root as Foo;

    runtime1.on("deltaSubmitted", (dds, delta) =>
    {
      runtime2.process(nn(dds.id), Delta.encode(delta), false);
    });

    foo1.count = 10;
    expect(foo2.count).toBe(10);
    expect(foo2.foo).toBe(null);

    foo1.foo = new Foo();
    expect(foo2.foo).toBeInstanceOf(Foo);

    foo1.foo.count = 20;
    expect(foo2.foo!.count).toBe(20);

    foo1.foo = null;
    expect(foo2.foo).toBe(null);

    expect(runtime1.objects.objectCount).toBe(2);
    runtime1.objects.collectGarbage();
    expect(runtime1.objects.objectCount).toBe(1);

    expect(runtime2.objects.objectCount).toBe(2);
    runtime2.objects.collectGarbage();
    expect(runtime2.objects.objectCount).toBe(1);
  });
});
