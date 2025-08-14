import { TimingControlPoint } from "@osucad/core";
import { EditorRuntime } from "@osucad/editor";
import { Vec2 } from "@osucad/framework";
import type { ServerMessages } from "@osucad/multiplayer-core";
import type { ClientMessages } from "@osucad/multiplayer-core";
import { HitCircle, OsuRuleset, PathPoint, PathType, Slider } from "@osucad/ruleset-osu";
import type { Server, Socket } from "socket.io";


export async function acceptConnections(io: Server)
{
  const runtime = await EditorRuntime.createEmpty(new OsuRuleset());

  const slider = new Slider();
  slider.position = new Vec2(100);
  slider.path.controlPoints = [
    new PathPoint(new Vec2(), PathType.PerfectCurve),
    new PathPoint(new Vec2(50, -20)),
    new PathPoint(new Vec2(100, 50)),
  ];
  slider.path.expectedDistance = slider.path.calculatedDistance;

  runtime.root.hitObjects.add(slider);

  const circle = new HitCircle();
  circle.startTime = 200;
  runtime.root.hitObjects.add(circle);

  const circle2 = new HitCircle();
  circle2.startTime = 220;
  runtime.root.hitObjects.add(circle2);

  const timingPoint = new TimingControlPoint();

  timingPoint.bpm = 180;
  runtime.root.controlPointInfo.add(timingPoint);

  let nextClientId = 0;

  io.on("connect", (socket: Socket<ClientMessages, ServerMessages>) =>
  {
    const clientId = ++nextClientId;

    socket.emit("init", { clientId, summary: runtime.createSummary() });

    socket.on("deltas", deltas =>
    {
      for (const delta of deltas)
        runtime.process(delta.targetId, delta.content, false);

      io.emit("deltas", clientId, deltas);
    });

    socket.on("signal", (target, type, signal) =>
    {
      io.emit("signal", clientId, target, type, signal);
    });
  });
}

