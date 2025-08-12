import { describe, expect, it } from "vitest";
import { DocumentRuntime } from "./DocumentRuntime.js";
import { DocumentHistory } from "./DocumentHistory.js";
import { ObjectDDS, type } from "../dds/index.js";

describe("DocumentHistory", () =>
{
  it("works", () =>
  {

    class Test extends ObjectDDS
    {
      constructor()
      {
        super({
          type: "test",
          version: 0,
        });
      }

      @type("int32")
      accessor value = 0;
    }

    const test = new Test();

    const runtime = DocumentRuntime.create(test, []);
    const history = new DocumentHistory(runtime);

    test.value = 10;

    expect(history.canUndo).toBe(false);
    expect(history.canRedo).toBe(false);

    expect(history.hasUncommittedChanges()).toBe(true);

    expect(history.commit()).toBe(true);

    expect(history.hasUncommittedChanges()).toBe(false);

    expect(test.value).toBe(10);

    expect(history.canUndo).toBe(true);
    expect(history.canRedo).toBe(false);

    expect(history.undo()).toBe(true);

    expect(history.canUndo).toBe(false);
    expect(history.canRedo).toBe(true);

    expect(test.value).toBe(0);
  });
});
