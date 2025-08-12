import { rulesets } from "@osucad/core";
import { EditorRuntime } from "@osucad/editor";
import { Vec2 } from "@osucad/framework";
import { syncRuntimes } from "@osucad/multiplayer-core";
import { inspect } from "node:util";
import { describe, expect, it } from "vitest";
import { HitCircle } from "../hitObjects/HitCircle";
import { PathPoint, PathType } from "../hitObjects/PathPoint";
import { Slider } from "../hitObjects/Slider";
import { OsuRuleset } from "../OsuRuleset";

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

    const slider1 = new Slider();
    runtime1.root.hitObjects.add(slider1);

    const slider2 = runtime2.root.hitObjects.hitObjects[1] as Slider;

    slider2.path.controlPoints = [new PathPoint(Vec2.zero(), PathType.Linear), new PathPoint(new Vec2(100, 0))];
    slider2.path.expectedDistance = 100;

    expect(slider1.path.calculatedPath.vertices).toStrictEqual([
      new Vec2(0,0),
      new Vec2(100,0),
    ]);

    console.log(inspect(runtime2.createSummary(), { depth: 4 }));
  });
});
