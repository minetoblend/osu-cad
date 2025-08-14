import { describe, it } from "vitest";
import { Document } from "./Document.js";
import { ObjectDDS, type } from "../dds/index.js";
import type { DDSAttributes } from "@osucad/multiplayer-protocol";
import { PrefixedIdGenerator, SequenceIdGenerator } from "../runtime/IdGenerator.js";
import * as util from "node:util";

describe("Document", () =>
{
  it("works", async () =>
  {
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

      @type("float32")
      accessor value = 0
    }

    const document = await Document.createDetached({
      schema: {
        Foo,
      },
      types: [Foo],
      idGenerator: new PrefixedIdGenerator("0:"),
    });

    console.log(util.inspect(document.createSummary(), { depth: 4, colors: true }));
  });
});
