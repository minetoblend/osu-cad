import type { DDSAttributes } from "@osucad/multiplayer-core";
import { ObjectDDS, type } from "@osucad/multiplayer-core";

export class BeatmapMetadata extends ObjectDDS
{
  static readonly attributes: DDSAttributes = {
    type: "@osucad/beatmap-metadata",
    version: 0,
  };

  constructor()
  {
    super(BeatmapMetadata.attributes);
  }

  @type("string")
  accessor artist = "";

  @type("string")
  accessor artistUnicode = "";

  @type("string")
  accessor title = "";

  @type("string")
  accessor titleUnicode = "";

  @type("string")
  accessor creator = "";

  @type("string")
  accessor difficultyName = "";

  @type("string")
  accessor source = "";

  @type("string")
  accessor tags = "";
}
