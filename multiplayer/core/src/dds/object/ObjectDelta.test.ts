import { describe, expect, it } from "vitest";
import { ObjectDelta, ObjectDeltaSerializer } from "./ObjectDelta.js";
import { ObjectDDS } from "./ObjectDDS.js";
import { type } from "./decorator.js";
import { encodeToBinary, encodeToJson } from "./testUtils.js";
import { BinaryWriter } from "../../serialization/binary/BinaryWriter.js";
import { BinaryReader } from "../../serialization/binary/BinaryReader.js";
import { BinaryDecoder } from "../../serialization/binary/BinaryDecoder.js";
import { JsonDecoder } from "../../serialization/json/JsonDecoder.js";

describe("ObjectDelta", () =>
{
  it("should encode properly", () =>
  {
    class Foo extends ObjectDDS
    {
      constructor()
      {
        super({
          type: "foo",
          version: 0,
        });
      }

      @type("string")
      accessor foo: string = "foo";

      @type("float32")
      accessor bar: number = 0;

      @type("boolean")
      accessor baz: boolean = false;
    }

    const foo = new Foo();

    const delta = new ObjectDelta(foo, [
      {
        property: 0,
        value: "bar",
      },
      {
        property: 2,
        value: true,
      },
    ]);

    const serializer = new ObjectDeltaSerializer(foo);

    console.log(encodeToJson(serializer, delta));
    console.log(encodeToBinary(serializer, delta));

    const json = encodeToJson(serializer, delta);

    const binary = encodeToBinary(serializer, delta);

    expect(json).toStrictEqual({ foo: "bar", baz: true });

    expect(binary).toStrictEqual(
        new BinaryWriter()
        // count
          .writeVarInt(2)
        // property index, value
          .writeVarInt(0)
          .writeString("bar")
        // property index, value
          .writeVarInt(2)
          .writeBoolean(true)
          .buffer,
    );

    expect(serializer.deserialize(new JsonDecoder(json))).toStrictEqual(delta);

    expect(serializer.deserialize(new BinaryDecoder(new BinaryReader(binary)))).toStrictEqual(delta);
  });
});
