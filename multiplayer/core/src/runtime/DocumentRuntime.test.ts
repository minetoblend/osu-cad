import { describe, expect, it } from "vitest";
import type { DDSAttributes } from "@osucad/multiplayer-protocol";
import { nested, ObjectDDS, type } from "../dds/index.js";
import { DocumentRuntime } from "./DocumentRuntime.js";
import { syncRuntimes } from "../utils/index.js";

describe("DocumentRuntime", () =>
{
  it("creates and loads summaries", async () =>
  {
    class Foo extends ObjectDDS
    {
      public static attributes: DDSAttributes = { type: "foo", version: 0 };

      public constructor()
      {
        super(Foo.attributes);
      }

      @type("int32") public accessor count = 0;
    }

    const foo = new Foo();
    const runtime = DocumentRuntime.create(foo, [Foo]);

    foo.count = 10;

    const runtime2 = await DocumentRuntime.load(runtime.createSummary(), [Foo]);

    expect(runtime2.root).toBeInstanceOf(Foo);
    const foo2 = runtime2.root as Foo;

    expect(foo2).not.toBe(foo);

    expect(foo2.count).toBe(10);

    runtime.on("deltaSubmitted", ({ id }, delta) => runtime2.replayDelta(id!, delta));

    foo.count = 20;
    expect(foo2.count).toBe(20);
  });

  it("validates required types", async () =>
  {
    class Foo extends ObjectDDS
    {
      public static attributes: DDSAttributes = { type: "foo", version: 0 };

      public constructor()
      {
        super(Foo.attributes);
      }
    }

    class Bar extends ObjectDDS
    {
      public static attributes: DDSAttributes = { type: "bar", version: 0 };

      public constructor()
      {
        super(Bar.attributes);
      }
    }

    const runtime = DocumentRuntime.create(new Foo(), [Foo, Bar]);

    await expect(DocumentRuntime.load(runtime.createSummary(), [Foo])).rejects.toThrow();
    await expect(DocumentRuntime.load(runtime.createSummary(), [Foo, Bar])).resolves.not.toThrow();
  });

  it("processes encoded deltas", async () =>
  {
    class Foo extends ObjectDDS
    {
      public static attributes: DDSAttributes = { type: "foo", version: 0 };

      public constructor()
      {
        super(Foo.attributes);
      }

      @type("int32")
      public accessor count = 0

      @nested(() => Foo, { nullable: true })
      public accessor foo: Foo | null = null
    }

    const foo1 = new Foo();

    const runtime1 = DocumentRuntime.create(foo1, [Foo]);
    const runtime2 = await DocumentRuntime.load(runtime1.createSummary(), [Foo]);

    const foo2 = runtime2.root as Foo;

    syncRuntimes(runtime1, runtime2);

    foo1.count = 10;
    expect(foo2.count).toBe(10);
    expect(foo2.foo).toBe(null);

    foo1.foo = new Foo();
    expect(foo2.foo).toBeInstanceOf(Foo);

    foo1.foo.count = 20;
    expect(foo2.foo!.count).toBe(20);

    foo1.foo = null;
    expect(foo2.foo).toBe(null);
  });
});
