import { EditorRuntime } from "@osucad/editor";
import { inspect } from "node:util";
import { describe, expect, it } from "vitest";
import { HitCircle } from "../hitObjects/HitCircle";
import { OsuRuleset } from "../OsuRuleset";
import { Delta, syncRuntimes } from "@osucad/multiplayer-core";
import { rulesets } from "@osucad/core";
import { Vec2 } from "@osucad/framework";

describe("EditorRuntime", () =>
{
  it("works",  async () =>
  {
    rulesets.register(new OsuRuleset());

    const runtime1 = await EditorRuntime.createEmpty(new OsuRuleset());
    const runtime2 = new EditorRuntime();

    await runtime2.load(runtime1.createSummary());

    syncRuntimes(runtime1, runtime2);

    const circle = new HitCircle();

    circle.startTime = 10;

    runtime1.root.hitObjects.add(circle);

    circle.x = 20;
    circle.y = 30;

    const circle2 = runtime2.root.hitObjects.hitObjects[0] as HitCircle;

    expect(circle2.startTime).toStrictEqual(10);
    expect(circle2.position).toStrictEqual(new Vec2(20, 30));
  });
});
