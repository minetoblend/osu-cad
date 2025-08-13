import { rulesets } from "@osucad/core";
import { EditorRuntime } from "@osucad/editor";
import { OsuRuleset } from "@osucad/ruleset-osu";


export class Room
{
  constructor(readonly runtime: EditorRuntime)
  {

  }

  static async create()
  {
    const runtime = await EditorRuntime.createEmpty(new OsuRuleset());

    return new Room(runtime);
  }
}

