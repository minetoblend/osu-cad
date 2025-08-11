import { describe, expect, it } from "vitest";
import { ObjectDDS } from "./ObjectDDS.js";
import { type } from "./decorator.js";
import { createBinarySummary, createJsonSummary } from "./testUtils.js";
import { BinaryWriter } from "../../serialization/binary/BinaryWriter.js";
import { JsonDecoder } from "../../serialization/json/JsonDecoder.js";
import { BinaryDecoder } from "../../serialization/binary/BinaryDecoder.js";

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

    const jsonSummary = createJsonSummary(counter);

    expect(jsonSummary).toStrictEqual({ value: 10, foo: "bar" });

    const binarySummary = createBinarySummary(counter);

    expect(binarySummary).toStrictEqual(
        new BinaryWriter()
          .writeUint32(10)
          .writeString("bar")
          .buffer);

    const jsonDecoder = new JsonDecoder({ value: 20, foo: "1234" });

    counter.load(jsonDecoder, 0);

    expect(counter.value).toBe(20);
    expect(counter.foo).toBe("1234");

    const binaryDecoder = new BinaryDecoder(
        new BinaryWriter()
          .writeUint32(100)
          .writeString("test")
          .asReader());

    counter.load(binaryDecoder, 0);

    expect(counter.value).toBe(100);
    expect(counter.foo).toBe("test");
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

    obj1.load(new JsonDecoder({ foo: "bar" }), 0);

    expect(obj1.foo).toEqual("bar");
    expect(obj1.bar).toEqual("");

    const obj2 = new TestObject();

    obj2.load(new JsonDecoder({ foo: "foo", bar: "bar" }), 1);

    expect(obj2.foo).toEqual("foo");
    expect(obj2.bar).toEqual("bar");

    expect(() =>
    {
      new TestObject().load(new JsonDecoder({ foo: "bar" }), 1);
    }).toThrowError();

    expect(() =>
    {
      new TestObject().load(new JsonDecoder({ foo: "foo", bar: "bar" }), 2);
    }).toThrowError();
  });
});
