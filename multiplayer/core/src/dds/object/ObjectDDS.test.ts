import { describe, expect, it } from "vitest";
import { ObjectDDS } from "./ObjectDDS.js";
import { nested, type } from "./decorator.js";
import type { DDSAttributes } from "../DDSAttributes.js";
import { DocumentRuntime } from "../../runtime/index.js";
import { Decoder, Encoder } from "../../serialization/types.js";
import { nn } from "../../utils/nn.js";
import { ObjectDelta } from "./ObjectDelta.js";
import { Delta } from "../Delta.js";

describe("ObjectDDS", () =>
{
  it("writes and loads summaries", () =>
  {
    class Counter extends ObjectDDS
    {
      constructor()
      {
        super({ type: "counter", version: 0 });
      }

      @type("uint32") accessor value = 0;

      @type("string") accessor foo = "bar";
    }

    const counter = new Counter();

    counter.value = 10;

    const summary = counter.createSummary(new Encoder());

    expect(summary).toStrictEqual({ value: 10, foo: "bar" });

    const decoder = new Decoder();

    counter.load({ value: 20, foo: "1234" }, 0, decoder);

    expect(counter.value).toBe(20);
    expect(counter.foo).toBe("1234");
  });

  it("correctly handles versioned properties", () =>
  {
    class TestObject extends ObjectDDS
    {
      constructor()
      {
        super({
          type: "test",
          version: 1,
        });
      }

      @type("string")
      accessor foo = "";

      @type("string", { since: 1 })
      accessor bar = "";
    }

    const obj1 = new TestObject();

    obj1.load({ foo: "bar" }, 0, new Decoder());

    expect(obj1.foo).toEqual("bar");
    expect(obj1.bar).toEqual("");

    const obj2 = new TestObject();

    obj2.load({ foo: "foo", bar: "bar" }, 1, new Decoder());

    expect(obj2.foo).toEqual("foo");
    expect(obj2.bar).toEqual("bar");

    expect(() =>
    {
      new TestObject().load({ foo: "bar" }, 1, new Decoder());
    }).toThrowError();

    expect(() =>
    {
      new TestObject().load({ foo: "foo", bar: "bar" }, 2, new Decoder());
    }).toThrowError();
  });

  it("supports nested dds objects", () =>
  {
    class Bar extends ObjectDDS
    {
      static readonly attributes: DDSAttributes = {
        type: "bar",
        version: 0,
      };

      constructor()
      {
        super(Bar.attributes);
      }

      @type("int32")
      accessor count = 0;
    }

    class Foo extends ObjectDDS
    {
      static readonly attributes: DDSAttributes = {
        type: "foo",
        version: 0,
      };

      constructor()
      {
        super(Foo.attributes);
      }

      @nested(Bar)
      accessor bar = new Bar();
    }

    const foo = new Foo();
    const runtime = DocumentRuntime.create(foo, [Foo, Bar]);

    runtime.on("deltaSubmitted", (dds, delta) => console.log(`dds: ${dds.id}`, delta));

    foo.bar.count = 10;

    const runtime2 = new DocumentRuntime([Foo, Bar]);
    runtime2.load(runtime.createSummary());

    const foo2 = runtime2.root as Foo;
    expect(foo2.bar.count).toBe(10);

    expect(foo.bar.id).toEqual(foo2.bar.id);

    runtime.on("deltaSubmitted", (dds, delta) =>
    {
      runtime2.replayDelta(dds.id!, delta);
    });

    const oldBar = foo.bar;

    foo.bar = new Bar();

    expect(foo.bar.isAttached).toBe(true);
    expect(foo2.bar.id).not.toEqual(oldBar.id);
    expect(foo.bar.id).toEqual(foo2.bar.id);
  });

  it("ignores changes for pending properties", () =>
  {
    class Counter extends ObjectDDS
    {
      static readonly attributes: DDSAttributes = { type: "counter", version: 0 };

      constructor()
      {
        super(Counter.attributes);
      }

      @type("uint32") accessor value = 0;
    }

    const counter = new Counter();
    const runtime = DocumentRuntime.create(counter, [Counter]);

    counter.value = 10;

    const delta = Delta.encode(ObjectDelta.from(0, counter.metadata.getPropertyByName("value")!, 20));

    runtime.process(nn(counter.id), delta, false);

    expect(counter.value).toBe(10);

    const localDelta = Delta.encode(ObjectDelta.from(1, counter.metadata.getPropertyByName("value")!, 10));

    runtime.process(nn(counter.id), localDelta, true);

    expect(counter.value).toBe(10);

    runtime.process(nn(counter.id), delta, false);

    expect(counter.value).toBe(20);
  });
});
