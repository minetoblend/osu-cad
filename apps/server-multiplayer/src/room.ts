import { EditorRuntime } from "@osucad/editor";
import { HitCircle, OsuRuleset } from "@osucad/ruleset-osu";
import type { Server } from "socket.io";


export async function acceptConnections(io: Server)
{
  const runtime = await EditorRuntime.createEmpty(new OsuRuleset());

  runtime.root.hitObjects.add(new HitCircle());

  let nextClientId = 0;

  io.on("connect", socket =>
  {
    const clientId = ++nextClientId;

    socket.emit("init", { clientId, summary: runtime.createSummary() });

    socket.on("delta", deltas =>
    {
      for (const delta of deltas)
        runtime.process(delta.targetId, delta.content, false);

      io.emit("delta", clientId, deltas);
    });
  });
}

