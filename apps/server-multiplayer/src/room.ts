import { EditorRuntime } from "@osucad/editor";
import { OsuRuleset } from "@osucad/ruleset-osu";
import type { Server } from "socket.io";


export async function acceptConnections(io: Server)
{
  const runtime = await EditorRuntime.createEmpty(new OsuRuleset());

  let nextClientId = 0;

  io.on("connect", socket =>
  {
    const clientId = ++nextClientId;

    socket.emit("init", { summary: runtime.createSummary() });

    socket.on("delta", delta =>
    {
      runtime.process(delta.targetId, delta.content, false);

      io.emit("delta", clientId, delta);
    });
  });
}

