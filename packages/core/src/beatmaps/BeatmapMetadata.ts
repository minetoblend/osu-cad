import type { DDSAttributes } from "@osucad/multiplayer-core";
import { ObjectDDS, type } from "@osucad/multiplayer-core";

export class BeatmapMetadata extends ObjectDDS
{
  public static readonly attributes: DDSAttributes = {
    type: "@osucad/beatmap-metadata",
    version: 0,
  };

  public constructor()
  {
    super(BeatmapMetadata.attributes);
  }

  @type("string")
  public accessor artist = "";

  @type("string")
  public accessor artistUnicode = "";

  @type("string")
  public accessor title = "";

  @type("string")
  public accessor titleUnicode = "";

  @type("string")
  public accessor creator = "";

  @type("string")
  public accessor difficultyName = "";

  @type("string")
  public accessor source = "";

  @type("string")
  public accessor tags = "";
}
